'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

/**
 * Extract YouTube video ID from URL
 */
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
function getVimeoVideoId(url: string): string | null {
  const patterns = [/vimeo\.com\/(\d+)/, /vimeo\.com\/video\/(\d+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function VideoPlayer({ videoUrl, title, className }: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [videoType, setVideoType] = useState<'youtube' | 'vimeo' | 'unknown'>('unknown');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoUrl) {
      return;
    }

    // Use a function to compute the embed URL and type
    const computeEmbed = () => {
      const youtubeId = getYouTubeVideoId(videoUrl);
      if (youtubeId) {
        return {
          url: `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`,
          type: 'youtube' as const,
        };
      }

      const vimeoId = getVimeoVideoId(videoUrl);
      if (vimeoId) {
        return {
          url: `https://player.vimeo.com/video/${vimeoId}`,
          type: 'vimeo' as const,
        };
      }

      // If it's a direct video URL, use HTML5 video player
      if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
        return {
          url: videoUrl,
          type: 'unknown' as const,
        };
      }

      return null;
    };

    const embed = computeEmbed();
    if (embed) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setEmbedUrl(embed.url);
        setVideoType(embed.type);
      }, 0);
    }
  }, [videoUrl]);

  if (!embedUrl) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted rounded-lg aspect-video',
          className
        )}
      >
        <p className="text-muted-foreground">Invalid video URL</p>
      </div>
    );
  }

  if (videoType === 'unknown' && embedUrl.match(/\.(mp4|webm|ogg)$/i)) {
    return (
      <div className={cn('rounded-lg overflow-hidden', className)}>
        <video src={embedUrl} controls className="w-full aspect-video" title={title}>
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg overflow-hidden bg-black', className)}>
      <div className="relative w-full aspect-video">
        <iframe
          src={embedUrl}
          title={title || 'Video player'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
