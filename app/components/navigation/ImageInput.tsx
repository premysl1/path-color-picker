'use client';

import { useRef, useEffect, Ref, RefObject} from 'react';
import NextImage from 'next/image';
import openFileIcon from '../../../public/icons/file_open_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';

export default function ImageInput({canvas, setUserImage}: {
  canvas: RefObject<HTMLCanvasElement | null>
  setUserImage: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>
}) {
  const input = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.currentTarget.files === null) {
      return;
    }

    createUserImage(e.currentTarget.files[0]);
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

  useEffect(() => {
    canvas.current?.addEventListener(`dragover`, handleCanvasDragover);
    window.addEventListener(`dragover`, handleWindowDragover);
    canvas.current?.addEventListener(`drop`, dropHandler);
    window.addEventListener(`drop`, handleDrop);

    function handleCanvasDragover(e: DragEvent) {
      if (!e.dataTransfer) {
        return;
      }

      const fileItems = [...e.dataTransfer.items].filter(
        (item) => item.kind === `file`,
      );
      if (fileItems.length > 0) {
        e.preventDefault();
        if (fileItems.some((item) => item.type.startsWith(`image/`))) {
          e.dataTransfer.dropEffect = `copy`;
        } else {
          e.dataTransfer.dropEffect = `none`;
        }
      }
    }

    function handleWindowDragover(e: DragEvent) {
      if (!(canvas.current
      && e.dataTransfer
      && e.target instanceof Node)) {
        return;
      }

      const fileItems = [...e.dataTransfer.items].filter(
        (item) => item.kind === `file`,
      );
      if (fileItems.length > 0) {
        e.preventDefault();
        if (!canvas.current.contains(e.target)) {
          e.dataTransfer.dropEffect = `none`;
        }
      }
    }

    function dropHandler(ev: DragEvent) {
      if (!ev.dataTransfer) {
        return;
      }

      ev.preventDefault();
      const files = [...ev.dataTransfer.items]
        .map((item) => item.getAsFile())
        .filter((file) => file);

      if (!files[0]) {
        return;
      }

      createUserImage(files[0]);
    }

    function handleDrop(e: DragEvent) {
      if (!e.dataTransfer) {
        return;
      }

      if ([...e.dataTransfer.items].some((item) => item.kind === `file`)) {
        e.preventDefault();
      }
    }

    return () => {
      canvas.current?.removeEventListener(`dragover`, handleCanvasDragover);
      window.removeEventListener(`dragover`, handleWindowDragover);
      canvas.current?.removeEventListener(`drop`, dropHandler);
      window.removeEventListener(`drop`, handleDrop);
    };
  }, []);

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
