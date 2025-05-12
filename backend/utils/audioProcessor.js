import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure ffmpeg with the installed path
ffmpeg.setFfmpegPath(ffmpegPath.path);

// Function to compress audio using ffmpeg
export const compressAudio = async (audioBuffer, mimeType) => {
  // Create temp files for input and output
  const tempDir = os.tmpdir();
  const inputExt = mimeType?.includes('webm') ? 'webm' : 'wav';
  const inputPath = path.join(tempDir, `input-${Date.now()}.${inputExt}`);
  const outputPath = path.join(tempDir, `output-${Date.now()}.mp3`);
  
  try {
    // Write the buffer to a temp file
    fs.writeFileSync(inputPath, audioBuffer);
    
    // Return a promise that resolves with the compressed audio buffer
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('24k') // Much lower bitrate for smaller file size
        .audioFrequency(8000) // 8kHz sample rate is sufficient for basic speech
        .audioChannels(1) // Mono audio
        .audioFilters('volume=1.5') // Increase volume slightly to improve transcription
        .format('mp3')
        .on('error', (err) => {
          console.error('Error compressing audio:', err);
          // If ffmpeg fails, use the fallback method
          try {
            const downsampledBuffer = downsampleAudio(audioBuffer);
            resolve(downsampledBuffer);
          } catch (downsampleErr) {
            reject(err);
          }
        })
        .on('end', () => {
          // Read the compressed file and return as buffer
          const compressedBuffer = fs.readFileSync(outputPath);
          
          // Clean up temp files
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
          
          resolve(compressedBuffer);
        })
        .save(outputPath);
    });
  } catch (error) {
    // Clean up temp files in case of error
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    
    // Use the fallback method
    return downsampleAudio(audioBuffer);
  }
};

// Fallback implementation using simple downsampling (if ffmpeg fails)
export const downsampleAudio = (audioBuffer) => {
  console.log('Using fallback audio downsampling method');
  
  // This is a simplified downsampling approach
  // For production, use a proper audio processing library
  
  // We'll simply take every 3rd byte to reduce file size by ~1/3
  // This will distort the audio but might work for basic transcription
  const downsampled = Buffer.alloc(Math.ceil(audioBuffer.length / 3));
  
  for (let i = 0, j = 0; i < audioBuffer.length; i += 3, j++) {
    downsampled[j] = audioBuffer[i];
  }
  
  return downsampled;
}; 