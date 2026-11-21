type Props = {
	frequency: number
	selectFormat: React.RefObject<HTMLSelectElement | null>
	canvas: React.RefObject<HTMLCanvasElement | null>
  userImage?: HTMLImageElement | null
}

interface Pixel {
  r: number,
  g: number,
  b: number,
  alpha: number,
  isEveryChannelEmpty: boolean
}

type samples = {
  rgba: {
    r: number,
    g: number,
    b: number,
    alpha: number
  },
  format: string,
  id: string
}[]
