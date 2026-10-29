'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { CoupleSilhouetteProps } from '@/types/scene';

export function CoupleSilhouette({
  position = [0.0, 1.15, 0.08],
  scale = 1.0,
}: CoupleSilhouetteProps) {
  // Generate high-resolution 1024x1024 procedural anime couple silhouette texture
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 1024, 1024);

    // ==========================================
    // 1. BOY SILHOUETTE (Left side, leaning at rail)
    // Posture: Forearms resting on rail (y ~ 440), head turned right
    // ==========================================
    ctx.beginPath();
    // Feet & Lower Legs
    ctx.moveTo(370, 990);
    ctx.lineTo(395, 990);
    ctx.lineTo(410, 750); // right knee
    ctx.lineTo(435, 750);
    ctx.lineTo(445, 990);
    ctx.lineTo(470, 990);
    ctx.lineTo(455, 680); // inner thigh
    ctx.lineTo(475, 610); // jacket right hem

    // Jacket & Torso
    ctx.bezierCurveTo(480, 560, 470, 480, 465, 420); // right ribcage to shoulder
    // Right arm resting on railing
    ctx.bezierCurveTo(475, 425, 495, 440, 490, 455); // right elbow
    ctx.lineTo(440, 445); // forearm resting on rail
    ctx.lineTo(420, 440); // right hand on rail

    // Boy Neck & Chin Profile (facing right toward the girl)
    ctx.lineTo(415, 385); // throat
    ctx.lineTo(425, 360); // jawline
    ctx.lineTo(432, 345); // chin
    ctx.lineTo(426, 335); // mouth/nose profile

    // Wind-blown Tousled Hair (Spikes blowing East / +X)
    ctx.lineTo(448, 320); // hair spike 1
    ctx.lineTo(430, 312);
    ctx.lineTo(458, 298); // hair spike 2
    ctx.lineTo(435, 290);
    ctx.lineTo(465, 270); // prominent wind tuft 3
    ctx.lineTo(438, 260);
    ctx.bezierCurveTo(420, 235, 385, 230, 365, 250); // top crown
    ctx.bezierCurveTo(345, 270, 340, 310, 345, 340); // back of head
    ctx.lineTo(340, 385); // nape

    // Left Shoulder & Leaning Left Arm
    ctx.bezierCurveTo(325, 400, 310, 420, 305, 450); // left elbow
    ctx.bezierCurveTo(320, 450, 360, 445, 395, 440); // left forearm along rail
    ctx.lineTo(350, 490); // back torso line
    ctx.bezierCurveTo(345, 540, 350, 600, 345, 640); // jacket left hemline
    ctx.lineTo(355, 750); // left leg outer
    ctx.lineTo(370, 990);
    ctx.closePath();

    // ==========================================
    // 2. GIRL SILHOUETTE (Right side, contemplative)
    // Posture: Hand on rail touching boy's hand, long hair flowing
    // ==========================================
    // Feet & Skirt
    ctx.moveTo(565, 990);
    ctx.lineTo(585, 990);
    ctx.lineTo(595, 780); // right leg
    ctx.lineTo(615, 780);
    ctx.lineTo(625, 990);
    ctx.lineTo(645, 990);
    ctx.lineTo(635, 730);

    // Billowing Pleated Skirt (fluttering rightward in wind)
    ctx.bezierCurveTo(665, 725, 705, 715, 685, 660); // skirt outer billow
    ctx.bezierCurveTo(670, 630, 650, 600, 640, 560); // waistline right
    ctx.lineTo(648, 480); // right side coat

    // Girl Right Arm hanging down relaxed
    ctx.bezierCurveTo(660, 510, 665, 560, 660, 580);
    ctx.lineTo(645, 580);
    ctx.bezierCurveTo(650, 530, 645, 470, 635, 430); // right shoulder

    // Long Flowing Hair (Magnificent Anime Strands streaming East)
    ctx.bezierCurveTo(655, 420, 695, 440, 735, 480); // long hair strand 1
    ctx.bezierCurveTo(715, 440, 685, 400, 665, 375);
    ctx.bezierCurveTo(705, 385, 755, 410, 780, 450); // long hair strand 2
    ctx.bezierCurveTo(740, 390, 700, 350, 660, 325);
    ctx.bezierCurveTo(695, 320, 740, 335, 765, 360); // high wispy strand
    ctx.bezierCurveTo(720, 310, 675, 280, 635, 275); // crown top right
    ctx.bezierCurveTo(605, 260, 575, 270, 560, 290); // crown top left

    // Girl Head tilted toward boy
    ctx.bezierCurveTo(550, 310, 555, 340, 565, 365); // left cheek & jaw
    ctx.lineTo(570, 385); // neck left

    // Girl Left Arm reaching forward to touch handrail near boy's hand
    ctx.bezierCurveTo(555, 400, 535, 420, 505, 440); // left hand touching rail!
    ctx.bezierCurveTo(525, 450, 550, 445, 565, 430); // forearm
    ctx.bezierCurveTo(560, 480, 555, 530, 550, 570); // left waist
    ctx.bezierCurveTo(540, 620, 535, 680, 550, 730); // skirt left edge
    ctx.lineTo(565, 990);
    ctx.closePath();

    // 3. Fill Core Silhouette with Deep Midnight Indigo
    ctx.fillStyle = '#080916';
    ctx.fill();

    // 4. City Skyline Warm Bounce Tint (source-atop overlay from bottom)
    ctx.globalCompositeOperation = 'source-atop';
    const cityGradient = ctx.createLinearGradient(0, 1024, 0, 450);
    cityGradient.addColorStop(0.0, 'rgba(75, 30, 50, 0.42)'); // warm magenta-amber glow
    cityGradient.addColorStop(0.5, 'rgba(45, 20, 35, 0.18)');
    cityGradient.addColorStop(1.0, 'rgba(8, 9, 22, 0.0)');
    ctx.fillStyle = cityGradient;
    ctx.fillRect(0, 0, 1024, 1024);

    // 5. Moonlight Silver-Cyan Rim Glow on Upper Windward Profiles
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(180, 210, 255, 0.85)';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = 'rgba(140, 190, 255, 0.75)';
    ctx.shadowBlur = 9;

    // Boy Hair Rim Stroke
    ctx.beginPath();
    ctx.moveTo(365, 250);
    ctx.bezierCurveTo(385, 230, 420, 235, 438, 260);
    ctx.lineTo(465, 270);
    ctx.lineTo(435, 290);
    ctx.lineTo(458, 298);
    ctx.lineTo(430, 312);
    ctx.lineTo(448, 320);
    ctx.stroke();

    // Girl Hair Rim Stroke
    ctx.beginPath();
    ctx.moveTo(560, 290);
    ctx.bezierCurveTo(575, 270, 605, 260, 635, 275);
    ctx.bezierCurveTo(675, 280, 720, 310, 765, 360);
    ctx.stroke();

    // Handrail Contact Rim (Moonlight reflecting off resting hands)
    ctx.beginPath();
    ctx.moveTo(395, 438);
    ctx.lineTo(440, 440);
    ctx.moveTo(495, 438);
    ctx.lineTo(515, 440);
    ctx.stroke();

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;
    canvasTexture.minFilter = THREE.LinearFilter;
    canvasTexture.magFilter = THREE.LinearFilter;
    canvasTexture.needsUpdate = true;
    return canvasTexture;
  }, []);

  // Cleanup texture on unmount
  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  return (
    <mesh
      position={position}
      scale={[scale * 2.4, scale * 2.3, 1.0]}
      name="couple-silhouette"
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        alphaTest={0.05}
        depthWrite={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default CoupleSilhouette;
