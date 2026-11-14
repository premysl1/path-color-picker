'use client';

import { useRef } from 'react';
import Image from 'next/image';
import openFileIcon from '../../../public/icons/file_open_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';

export default function ImageInput() {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={fileInput}
        id="image-input"
        type="file"
        accept="image/*"
        hidden
      />
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        className="image-input-button"
      >
        <Image src={openFileIcon} alt="" />
        Click to pick an image.
      </button>
    </>
  );
}