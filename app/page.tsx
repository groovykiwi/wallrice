"use client";

import { MacBookPreview } from "../components/MacBookPreview";
import { HeroSection } from "../components/HeroSection";
import { ImageUploadPanel } from "../components/ImageUploadPanel";
import { ColorSelectionPanel } from "../components/ColorSelectionPanel";
import { Footer } from "../components/Footer";
import { useWallriceController } from "../hooks/useWallriceController";

export default function ModernImageColorizer() {
  const {
    canvasRef,
    heroSectionProps,
    previewProps,
    uploadPanelProps,
    colorSelectionPanelProps,
  } = useWallriceController();

  return (
    <div className="min-h-screen bg-background">
      <HeroSection {...heroSectionProps} />

      {/* MacBook Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative">
        <div className="relative">
          <MacBookPreview {...previewProps} />
        </div>
      </div>

      {/* Main Control Panel */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-8 border-t border-slate-200 mt-8">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          <ImageUploadPanel {...uploadPanelProps} />
          <ColorSelectionPanel {...colorSelectionPanelProps} />
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
      <Footer />
    </div>
  );
}
