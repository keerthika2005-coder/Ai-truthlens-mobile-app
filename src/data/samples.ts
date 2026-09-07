import { SampleMedia } from '../types';

export const SAMPLE_MEDIA: SampleMedia[] = [
  {
    id: 'sample-ai-portrait',
    title: 'Synthetic AI Cyber-Portrait',
    type: 'image',
    badge: 'Synthetic',
    description: 'Diffusion model generated character with smoothed skin texture & volumetric specular reflections.',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    fileName: 'ai_diffusion_portrait.jpg'
  },
  {
    id: 'sample-real-camera',
    title: 'Authentic DSLR Camera Portrait',
    type: 'image',
    badge: 'Authentic',
    description: 'Captured with Canon EOS R5 sensor showing natural sub-dermal noise and optical depth of field.',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    fileName: 'dslr_optical_portrait.jpg'
  },
  {
    id: 'sample-ai-architecture',
    title: 'AI Dreamscape Architecture',
    type: 'image',
    badge: 'Synthetic',
    description: 'Generative architectural fantasy exhibiting structural non-Euclidean geometry and floating artifacts.',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    fileName: 'ai_architecture_render.jpg'
  },
  {
    id: 'sample-real-landscape',
    title: 'Sensor-Captured Mountain Landscape',
    type: 'image',
    badge: 'Authentic',
    description: 'Authentic optical landscape with atmospheric haze, atmospheric particulate diffraction, and sensor grain.',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    fileName: 'authentic_alps_landscape.jpg'
  }
];
