import { createAnimationAPI } from "./animation"
import { createCurveAPI } from "./curve"
import { lerp } from "./math"

/**
 * An API that lets you perform operations on the components of a vector
 */
export type VectorComponentsAPI<T> = {
  create: (initial: number) => T,
  unary: (left: T, operation: (left: number) => number) => T,
  binary: (left: T, right: T, operation: (left: number, right: number) => number) => T,
}

export type VectorScalarAPI<T> = {
  add(left: T, right: number): T,
  multiply(left: T, right: number): T,
}

export type VectorAPI<T> = {
  ZERO: T,
  ONE: T,

  create: (initial: number) => T,
  interpolate(start: T, end: T, progress: number): T,

  add(left: T, right: T): T,
  subtract(left: T, right: T): T,
  multiply(left: T, right: T): T,
  divide(left: T, right: T): T,

  ComponentsAPI: VectorComponentsAPI<T>,
  ScalarAPI: VectorScalarAPI<T>
}

export const createVectorScalarAPI = <T>(
  unaryOperation: (left: T, operation: (left: number) => number) => T,
): VectorScalarAPI<T> => {
  return {
    add(left, right) {
      return unaryOperation(left, left => left + right)
    },
    multiply(left, right) {
      return unaryOperation(left, left => left * right)
    },
  }
}

export const createVectorAPI = <T>(ComponentsAPI: VectorComponentsAPI<T>) => {
  const VectorAPI: VectorAPI<T> = {
    ScalarAPI: createVectorScalarAPI(ComponentsAPI.unary),
    ComponentsAPI,

    ZERO: ComponentsAPI.create(0),
    ONE: ComponentsAPI.create(1),
    create: ComponentsAPI.create,

    interpolate(start, end, progress) {
      return ComponentsAPI.binary(start, end, (l, r) => lerp(l, r, progress))
    },

    add(left, right) {
      return ComponentsAPI.binary(left, right, (l, r) => l + r)
    },
    subtract(left, right) {
      return ComponentsAPI.binary(left, right, (l, r) => l - r)
    },
    multiply(left, right) {
      return ComponentsAPI.binary(left, right, (l, r) => l * r)
    },
    divide(left, right) {
      return ComponentsAPI.binary(left, right, (l, r) => l / r)
    },
  }

  return VectorAPI;
}

export type Vector1D = {
  x: number
}
export const Vector1D = createVectorAPI({
  create: value => ({
    x: value,
  }),
  unary: (left, operation) => ({
    x: operation(left.x)
  }),
  binary: (left, right, operation) => ({
    x: operation(left.x, right.x)
  }),
});

export type Vector2D = {
  x: number,
  y: number,
}
export const Vector2D = createVectorAPI<Vector2D>({
  create: value => ({
    x: value,
    y: value,
  }),
  unary: (left, operation) => ({
    x: operation(left.x),
    y: operation(left.y),
  }),
  binary: (left, right, operation) => ({
    x: operation(left.x, right.x),
    y: operation(left.y, right.y),
  }),
});

export type Vector3D = {
  x: number,
  y: number,
  z: number,
}
export const Vector3D = createVectorAPI<Vector3D>({
  create: value => ({
    x: value,
    y: value,
    z: value,
  }),
  unary: (left, operation) => ({
    x: operation(left.x),
    y: operation(left.y),
    z: operation(left.z),
  }),
  binary: (left, right, operation) => ({
    x: operation(left.x, right.x),
    y: operation(left.y, right.y),
    z: operation(left.z, right.z),
  }),
});

export type Vector4D = {
  x: number,
  y: number,
  z: number,
  w: number,
}

export const Curve1D = createCurveAPI(Vector1D);
export const Animation1D = createAnimationAPI(Curve1D);

export const Curve2D = createCurveAPI(Vector2D);
export const Animation2D = createAnimationAPI(Curve2D);

export const Curve3D = createCurveAPI(Vector3D);
export const Animation3D = createAnimationAPI(Curve3D);