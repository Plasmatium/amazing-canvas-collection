let seed = Math.random()

export const setSeed = (s: number) => {
  if (seed < 0) {
    throw Error(`seed must >= 0, got: ${s}`)
  }
  seed = s + 0.5
}

export const random = () => {
  let ret = Math.abs(Math.sin(seed))
  let sig = String(ret).slice(11, -1)
  seed = Number(sig) / 1000
  return ret
}