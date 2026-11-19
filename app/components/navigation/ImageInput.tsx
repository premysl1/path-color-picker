'use client';

import React, { useRef } from 'react';
import NextImage from 'next/image';
import openFileIcon from '../../../public/icons/file_open_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';

export default function ImageInput({setUserImage}: {
  setUserImage: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>
}) {
  const input = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.currentTarget.files === null) {
      return;
    }

    async function createUserImage(file: File) {
      const image = new Image();
      let objectURL: string;
  
      await new Promise<void>((resolve, reject) => {
        image.onload = () => {
          setUserImage(image);
  
          URL.revokeObjectURL(objectURL);
          resolve();
        };

        image.onerror = () => {
          URL.revokeObjectURL(objectURL);
          reject();
          console.error(`Image rejected.`);
        }
  
        objectURL = URL.createObjectURL(file);
        image.src = objectURL;
      });
    }

    createUserImage(e.currentTarget.files[0]);
  }

  return (
    <>
      <input 
      onChange={handleChange}
      ref={input}
      id="image-input"
      type="file"
      accept="image/*"
      hidden/>
      <button onClick={() => input.current?.click()}>
        <NextImage src={openFileIcon} alt="" />
        Click to pick an image.
      </button>
    </>
  );
}