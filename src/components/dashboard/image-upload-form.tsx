'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, Camera, AlertCircle, RefreshCw, CheckCircle2, Sparkles, Plus, Edit2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeUploadedFoodImage } from '@/lib/actions';
import type { WasteData } from '@/lib/types';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ImageUploadFormProps {
  onWasteAdd: (entry: Omit<WasteData, 'id' | 'timestamp' | 'imageUrl'> & { imageUrl?: string }) => void;
}

export default function ImageUploadForm({ onWasteAdd }: ImageUploadFormProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [activeTab, setActiveTab] = useState('upload');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>(undefined);

  // Verification & Confirmation state after AI analysis
  const [analysisResult, setAnalysisResult] = useState<{
    foodType: string;
    estimatedQuantity: string;
    isFallback?: boolean;
    message?: string;
  } | null>(null);

  // Manual Entry State
  const [manualFoodType, setManualFoodType] = useState('');
  const [manualQuantity, setManualQuantity] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let isMounted = true;

    const enableCamera = async () => {
      if (activeTab !== 'camera') {
        return;
      }

      setIsCameraLoading(true);
      setHasCameraPermission(null);

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera not supported by this browser.');
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');

        if (isMounted) {
          setCameras(videoDevices);
        }

        let deviceIdToUse = selectedCameraId;
        if (videoDevices.length > 0 && (!deviceIdToUse || !videoDevices.find((d) => d.deviceId === deviceIdToUse))) {
          const backCamera = videoDevices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
          );
          deviceIdToUse = backCamera ? backCamera.deviceId : videoDevices[0].deviceId;

          if (isMounted) {
            setSelectedCameraId(deviceIdToUse);
          }
        }

        const constraints: MediaStreamConstraints = {
          video: deviceIdToUse ? { deviceId: { ideal: deviceIdToUse } } : { facingMode: 'environment' },
        };

        try {
          currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (innerError) {
          console.warn('Failed with preferred camera constraints, trying fallback:', innerError);
          currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        if (!isMounted) {
          currentStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
          try {
            await videoRef.current.play();
          } catch (playError) {
            console.error('Error playing video:', playError);
          }
        }
      } catch (error) {
        if (!isMounted) return;

        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        let description = 'Please enable camera permissions in your browser settings to use this feature.';
        if (error instanceof Error && (error.message.includes('not supported') || error.name === 'NotAllowedError')) {
          description = error.message;
        } else if (error instanceof Error && (error.name === 'NotReadableError' || error.name === 'TrackStartError')) {
          description = 'The camera is in use by another application or could not be started.';
        }

        toast({
          variant: 'destructive',
          title: 'Camera Access Error',
          description,
        });
      } finally {
        if (isMounted) {
          setIsCameraLoading(false);
        }
      }
    };

    enableCamera();

    return () => {
      isMounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [activeTab, selectedCameraId, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setAnalysisResult(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawResult = e.target?.result as string;
        if (!rawResult) return;
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setPreview(compressed);
          } else {
            setPreview(rawResult);
          }
        };
        img.onerror = () => {
          setPreview(rawResult);
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const maxDim = 1280;
      let width = video.videoWidth || 640;
      let height = video.videoHeight || 480;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, width, height);
        const dataUri = canvas.toDataURL('image/jpeg', 0.82);
        setPreview(dataUri);
        setFileName('camera-capture.jpg');
        setAnalysisResult(null);
        setActiveTab('upload'); // Switch to preview tab
      }
    }
  };

  const handleAnalyzeClick = async () => {
    if (!preview) {
      toast({
        title: 'No Image Available',
        description: 'Please upload or capture a food waste photo first.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeUploadedFoodImage({ foodImageDataUri: preview });
      setAnalysisResult({
        foodType: result.foodWasteAnalysis.foodType,
        estimatedQuantity: result.foodWasteAnalysis.estimatedQuantity,
        isFallback: result.isFallback,
        message: result.message,
      });

      toast({
        title: result.isFallback ? 'Visual Estimation Complete' : 'AI Analysis Successful',
        description: `Identified ${result.foodWasteAnalysis.foodType} (${result.foodWasteAnalysis.estimatedQuantity}). Review details below.`,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      // Even if uncaught error, provide responsive fallback
      setAnalysisResult({
        foodType: 'Kitchen Plate Scraps',
        estimatedQuantity: '160g',
        isFallback: true,
        message: 'Default estimation applied. Adjust values before logging.',
      });
      toast({
        title: 'Applied Estimation',
        description: 'Applied default food estimation so you can continue logging.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmLog = () => {
    if (!analysisResult) return;
    onWasteAdd({
      foodType: analysisResult.foodType.trim() || 'Unspecified Food',
      estimatedQuantity: analysisResult.estimatedQuantity.trim() || '100g',
      imageUrl: preview || undefined,
    });

    toast({
      title: 'Waste Logged',
      description: `Saved ${analysisResult.foodType} (${analysisResult.estimatedQuantity}) to log table.`,
    });

    // Reset state
    resetPreview();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFoodType.trim()) {
      toast({
        title: 'Food Type Required',
        description: 'Please enter the name of the food wasted.',
        variant: 'destructive',
      });
      return;
    }

    let qty = manualQuantity.trim() || '150g';
    if (!qty.endsWith('g') && !qty.endsWith('kg')) {
      qty = `${qty}g`;
    }

    onWasteAdd({
      foodType: manualFoodType.trim(),
      estimatedQuantity: qty,
    });

    toast({
      title: 'Waste Logged Manually',
      description: `Logged ${manualFoodType.trim()} (${qty}).`,
    });

    setManualFoodType('');
    setManualQuantity('');
  };

  const resetPreview = () => {
    setPreview(null);
    setFileName('');
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSwitchCamera = () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex((c) => c.deviceId === selectedCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      setSelectedCameraId(cameras[nextIndex].deviceId);
    }
  };

  const handleTabChange = (value: string) => {
    resetPreview();
    setActiveTab(value);
  };

  return (
    <Card className="h-full border-border/70 shadow-sm flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Log Food Waste
          </CardTitle>
          <CardDescription>
            Snap a photo or upload kitchen leftovers for instant AI quantity & category detection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="camera">Camera</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>

            {/* TAB 1: UPLOAD */}
            <TabsContent value="upload" className="space-y-3 pt-2">
              <div
                className="relative flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/40 transition-colors overflow-hidden bg-muted/20"
                onClick={() => !analysisResult && fileInputRef.current?.click()}
              >
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Click to upload photo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG or WebP up to 10MB</p>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={isAnalyzing}
                />
              </div>

              {fileName && !analysisResult && (
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span className="truncate max-w-[200px]">{fileName}</span>
                  <Button variant="ghost" size="sm" onClick={resetPreview} className="h-6 px-2 text-xs">
                    Clear
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: CAMERA */}
            <TabsContent value="camera" className="space-y-3 pt-2">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  onLoadedData={() => setIsCameraLoading(false)}
                />
                {cameras.length > 1 && hasCameraPermission && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSwitchCamera}
                    className="absolute top-2 right-2 z-10 bg-background/70 hover:bg-background/90"
                    title="Switch Camera"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                {activeTab === 'camera' && isCameraLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Starting camera stream...</p>
                  </div>
                )}
                {hasCameraPermission === false && (
                  <Alert variant="destructive" className="m-4 absolute inset-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription className="text-xs">
                      Please allow camera permission in your browser or switch to file upload.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <Button
                onClick={handleCapture}
                disabled={!hasCameraPermission || isCameraLoading}
                className="w-full"
                variant="outline"
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Snapshot
              </Button>
            </TabsContent>

            {/* TAB 3: MANUAL ENTRY */}
            <TabsContent value="manual" className="pt-2">
              <form onSubmit={handleManualSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Food Name / Type
                  </label>
                  <Input
                    placeholder="e.g. Steamed Rice, Sliced Baguette, Tomato Sauce"
                    value={manualFoodType}
                    onChange={(e) => setManualFoodType(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Weight / Quantity
                  </label>
                  <Input
                    placeholder="e.g. 180g or 0.25kg"
                    value={manualQuantity}
                    onChange={(e) => setManualQuantity(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Save to Waste Log
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* AI ANALYSIS RESULTS CARD */}
          {analysisResult && (
            <div className="rounded-lg border bg-card p-3.5 space-y-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span>Detection Results</span>
                </div>
                {analysisResult.isFallback && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                    Heuristic Estimate
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Food Type (Editable)
                  </label>
                  <Input
                    value={analysisResult.foodType}
                    onChange={(e) =>
                      setAnalysisResult({ ...analysisResult, foodType: e.target.value })
                    }
                    className="h-8 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Quantity (Editable)
                  </label>
                  <Input
                    value={analysisResult.estimatedQuantity}
                    onChange={(e) =>
                      setAnalysisResult({ ...analysisResult, estimatedQuantity: e.target.value })
                    }
                    className="h-8 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button onClick={handleConfirmLog} className="flex-1 h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Confirm & Save Log
                </Button>
                <Button onClick={resetPreview} variant="outline" size="sm" className="h-9 px-2.5 text-xs text-muted-foreground">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Retake
                </Button>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS (When not yet analyzed) */}
          {!analysisResult && activeTab !== 'manual' && (
            <div className="space-y-2">
              <Button
                onClick={handleAnalyzeClick}
                disabled={isAnalyzing || !preview}
                className="w-full gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Waste with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze Food Waste
                  </>
                )}
              </Button>
              {preview && (
                <Button onClick={resetPreview} variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                  Discard Photo
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
