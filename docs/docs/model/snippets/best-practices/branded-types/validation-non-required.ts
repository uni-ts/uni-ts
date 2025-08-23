import { createModel, type InferModelOutput } from '@uni-ts/model';
import { z } from 'zod';

export type VideoTitle = InferModelOutput<typeof VideoTitle>;
export const VideoTitle = createModel(z.string().brand('VideoTitle'));

// Those functions will work the same way for any string
declare function createSlug(videoTitle: VideoTitle): string;
declare function truncate(videoTitle: VideoTitle, maxLength: number): string;

export type SongTitle = InferModelOutput<typeof SongTitle>;
export const SongTitle = createModel(z.string().brand('SongTitle'));

// Due to type branding, we need do duplicate all functions
declare function createSlug(songTitle: SongTitle): string;
declare function truncate(songTitle: SongTitle, maxLength: number): string;
