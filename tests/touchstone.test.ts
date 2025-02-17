import { describe, it, expect } from 'vitest'
import { abs, arg, Complex, log10, pi, round } from 'mathjs'
import {
  Touchstone,
  TouchstoneFormats,
  TouchstoneParameters,
} from '@/touchstone'

describe('touchstone.ts', () => {
  it('Valid class', () => {
    expect(Touchstone).toBeTruthy()
  })
  it('Touchstone:format', () => {
    const touchstone = new Touchstone()
    expect(touchstone.format).toBe(undefined)
    // Wrong input type
    expect(() => (touchstone.format = 0 as never)).toThrow(
      `Unknown Touchstone format: 0`
    )
    expect(() => (touchstone.format = [] as never)).toThrow(
      `Unknown Touchstone format: `
    )
    expect(() => (touchstone.format = {} as never)).toThrow(
      `Unknown Touchstone format: [object Object]`
    )
    // Wrong input value
    expect(() => (touchstone.format = 'z' as never)).toThrow(
      `Unknown Touchstone format: z`
    )
    // Correct input values
    for (const format of TouchstoneFormats) {
      touchstone.format = format.toLowerCase() as never
      expect(touchstone.format).toBe(format)
    }
    // Undefined input value
    for (const format of [undefined, null]) {
      touchstone.format = format as never
      expect(touchstone.format).toBe(undefined)
    }
  })
  it('Touchstone:parameter', () => {
    const touchstone = new Touchstone()
    expect(touchstone.parameter).toBe(undefined)
    // Wrong input type
    expect(() => (touchstone.parameter = 0 as never)).toThrow(
      `Unknown Touchstone paramter: 0`
    )
    expect(() => (touchstone.parameter = [] as never)).toThrow(
      `Unknown Touchstone paramter: `
    )
    expect(() => (touchstone.parameter = {} as never)).toThrow(
      `Unknown Touchstone paramter: [object Object]`
    )
    // Wrong input value
    expect(() => (touchstone.parameter = 'x' as never)).toThrow(
      `Unknown Touchstone paramter: x`
    )
    // Correct input values
    for (const parameter of TouchstoneParameters) {
      touchstone.parameter = parameter.toLowerCase() as never
      expect(touchstone.parameter).toBe(parameter)
    }
    // Undefined input value
    for (const parameter of [undefined, null]) {
      touchstone.parameter = parameter as never
      expect(touchstone.parameter).toBe(undefined)
    }
  })
  it('Touchstone:impedance', () => {
    const touchstone = new Touchstone()
    expect(touchstone.impedance).toBe(50)
    // Wrong input type
    expect(() => (touchstone.impedance = 'a' as never)).toThrow(
      `Unknown Touchstone impedance: a`
    )
    expect(() => (touchstone.impedance = [50, 'a'] as never)).toThrow(
      `Unknown Touchstone impedance: 50,a`
    )
    expect(() => (touchstone.impedance = [] as never)).toThrow(
      `Unknown Touchstone impedance: `
    )
    expect(() => (touchstone.impedance = {} as never)).toThrow(
      `Unknown Touchstone impedance: [object Object]`
    )
    // Correct input values
    for (const impedance of [0, 10.5, 50, [10], [10, 25], [30, 67.1, 80.9]]) {
      touchstone.impedance = impedance
      expect(touchstone.impedance).toStrictEqual(impedance)
    }
    // Undefined input value
    for (const impedance of [undefined, null]) {
      expect(() => (touchstone.impedance = impedance as never)).toThrow(
        `Unknown Touchstone impedance: ${impedance}`
      )
    }
  })
  it('Touchstone:nports', () => {
    const touchstone = new Touchstone()
    expect(touchstone.nports).toBe(undefined)
    // Wrong input type
    expect(() => (touchstone.nports = 'a' as never)).toThrow(
      `Unknown ports number: a`
    )
    expect(() => (touchstone.nports = [50, 'a'] as never)).toThrow(
      `Unknown ports number: 50,a`
    )
    expect(() => (touchstone.nports = [] as never)).toThrow(
      `Unknown ports number: `
    )
    expect(() => (touchstone.nports = {} as never)).toThrow(
      `Unknown ports number: [object Object]`
    )
    expect(() => (touchstone.nports = 1.3)).toThrow(`Unknown ports number: 1.3`)
    expect(() => (touchstone.nports = 0)).toThrow(`Unknown ports number: 0`)
    expect(() => (touchstone.nports = -5)).toThrow(`Unknown ports number: -5`)
    // Correct input values
    for (const nports of [1, 6, 13, 50]) {
      touchstone.nports = nports
      expect(touchstone.nports).toStrictEqual(nports)
    }
    // Undefined input value
    for (const nports of [undefined, null]) {
      touchstone.nports = nports as never
      expect(touchstone.nports).toBe(undefined)
    }
  })
  it('readFromString error: no option line', () => {
    const string = `
      ! 1-port S-parameter file
      100 0.99 -4 200 0.80 -22 300 0.707 -45
    `
    const touchstone = new Touchstone()
    expect(touchstone.readFromString).toBeTruthy()
    expect(() => touchstone.readFromString(string, 1)).toThrow(
      'Unable to find the option line starting with "#"'
    )
  })
  it('readFromString error: multiple option lines', () => {
    const string = `
      ! 1-port S-parameter file
      # MHz S MA R 50
      # MHz S MA R 50
      # MHz S MA R 50
      100 0.99 -4 200 0.80 -22 300 0.707 -45
    `
    const touchstone = new Touchstone()
    expect(() => touchstone.readFromString(string, 1)).toThrow(
      'Only one option line starting with "#" is supported, but found 3 lines'
    )
  })
  it('readFromString error: wrong impedance token', () => {
    const string = `
      ! 1-port S-parameter file
      # MHz  S MA  Z  50 
      100 0.99 -4 200 0.80 -22 300 0.707 -45
    `
    const touchstone = new Touchstone()
    expect(() => touchstone.readFromString(string, 1)).toThrow(
      'Uknown Touchstone impedance: Z 50'
    )
  })
  it('readFromString error: wrong single impedance value', () => {
    const string = `
      ! 1-port S-parameter file
      # MHz  S MA  r  resistance 
      100 0.99 -4 200 0.80 -22 300 0.707 -45
    `
    const touchstone = new Touchstone()
    expect(() => touchstone.readFromString(string, 1)).toThrow(
      'Uknown Touchstone impedance: r resistance'
    )
  })
  it('readFromString error: wrong multiple impedance values', () => {
    const string = `
      ! 1-port S-parameter file
      # MHz  S MA  r 50 resistance 
      100 0.99 -4 200 0.80 -22 300 0.707 -45
    `
    const touchstone = new Touchstone()
    expect(() => touchstone.readFromString(string, 1)).toThrow(
      'Uknown Touchstone impedance: r 50 resistance'
    )
  })
  it('readFromString: invalid data number', () => {
    const string = `
      ! 1-port S-parameter file
      # MHz S MA
      100 0.99 
      -4 200 0.80 
      -22 300 
      0.707
    `
    const touchstone = new Touchstone()
    expect(() => touchstone.readFromString(string, 1)).toThrow(
      'Touchstone invalid data number: 8, which should be multiple of 3'
    )
    expect(touchstone.comments).toStrictEqual(['1-port S-parameter file'])
    expect(touchstone.format).toBe('MA')
    expect(touchstone.parameter).toBe('S')
    expect(touchstone.impedance).toBe(50)
    expect(touchstone.nports).toBe(1)
    expect(touchstone.frequency!.unit).toBe('MHz')
  })
  it('readFromString: 1-port S-parameter file, no impedance', () => {
    const string = `
      ! 1-port S-parameter file
      # MHz S MA
      100 0.99
      -4 200 0.80
      -22 300
      0.707 -45
    `
    const touchstone = new Touchstone()
    touchstone.readFromString(string, 1)
    expect(touchstone.comments).toStrictEqual(['1-port S-parameter file'])
    expect(touchstone.format).toBe('MA')
    expect(touchstone.parameter).toBe('S')
    expect(touchstone.impedance).toBe(50)
    expect(touchstone.nports).toBe(1)
    // Check frequency
    expect(touchstone.frequency).toBeTruthy()
    expect(touchstone.frequency!.unit).toBe('MHz')
    expect(touchstone.frequency!.value).toStrictEqual([100, 200, 300])
    // Check matrix
    expect(touchstone.matrix).toBeTruthy()
    expect(touchstone.matrix!.length).toBe(1)
    touchstone.matrix!.forEach((array) => {
      expect(array.length).toBe(1)
      array.forEach((a) => {
        expect(a.length).toBe(3)
      })
    })
    // S11
    expect(touchstone.matrix![0][0].map((c) => round(abs(c), 5))).toStrictEqual(
      [0.99, 0.8, 0.707]
    )
    expect(
      touchstone.matrix![0][0].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([-4, -22, -45])
  })
  it('readFromString: 3-port S-parameter file, three impedances', () => {
    const string = `
      ! 3-port S-parameter file
      # Hz S MA R 20 35 60
      ! Freq     S11_Mag    S11_Ang     S12_Mag    S12_Ang     S13_Mag    S13_Ang     S21_Mag    S21_Ang     S22_Mag    S22_Ang     S23_Mag    S23_Ang     S31_Mag    S31_Ang     S32_Mag    S32_Ang     S33_Mag    S33_Ang
      ! ---------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------
      1.000E+06  0.80       -20.0       0.05        30.0       0.03       -45.0       0.05       -30.0       0.75       -10.0       0.02        15.0       0.02        45.0       0.03        -10.0       0.70       -5.0
      5.000E+06  0.75       -40.0       0.10        45.0       0.06       -60.0       0.10       -45.0       0.70       -20.0       0.04        25.0       0.04        60.0       0.06        -20.0       0.65       -10.0
      1.000E+07  0.70       -60.0       0.15        60.0       0.09       -75.0       0.15       -60.0       0.65       -30.0       0.06        35.0       0.06       -75.0       0.09        -30.0       0.60       -15.0
      5.000E+07  0.60       -80.0       0.20        75.0       0.12       -90.0       0.20       -75.0       0.55       -40.0       0.08        45.0       0.08       -90.0       0.12        -40.0       0.50       -20.0
      1.000E+08  0.50      -100.0       0.25        90.0       0.15      -105.0       0.25       -90.0       0.45       -50.0       0.10        55.0       0.10      -105.0       0.15        -50.0       0.40       -25.0
    `
    const touchstone = new Touchstone()
    touchstone.readFromString(string, 3)
    expect(touchstone.comments.length).toBe(3)
    expect(touchstone.comments[0]).toBe('3-port S-parameter file')
    expect(touchstone.format).toBe('MA')
    expect(touchstone.parameter).toBe('S')
    expect(touchstone.impedance).toStrictEqual([20, 35, 60])
    expect(touchstone.nports).toBe(3)
    expect(touchstone.frequency).toBeTruthy()
    expect(touchstone.frequency!.unit).toBe('Hz')
    expect(touchstone.frequency!.value).toStrictEqual([1e6, 5e6, 1e7, 5e7, 1e8])
    expect(touchstone.matrix).toBeTruthy()
    expect(touchstone.matrix!.length).toBe(3)
    touchstone.matrix!.forEach((array) => {
      expect(array.length).toBe(3)
      array.forEach((a) => {
        expect(a.length).toBe(5)
      })
    })
    // S11
    expect(touchstone.matrix![0][0].map((c) => round(abs(c), 5))).toStrictEqual(
      [0.8, 0.75, 0.7, 0.6, 0.5]
    )
    expect(
      touchstone.matrix![0][0].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([-20, -40, -60, -80, -100])
    // S12
    expect(touchstone.matrix![0][1].map((c) => round(abs(c), 5))).toStrictEqual(
      [0.05, 0.1, 0.15, 0.2, 0.25]
    )
    expect(
      touchstone.matrix![0][1].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([30, 45, 60, 75, 90])
    // S13
    expect(touchstone.matrix![0][2].map((c) => round(abs(c), 5))).toStrictEqual(
      [0.03, 0.06, 0.09, 0.12, 0.15]
    )
    expect(
      touchstone.matrix![0][2].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([-45, -60, -75, -90, -105])
    // S21
    expect(touchstone.matrix![1][0].map((c) => round(abs(c), 5))).toStrictEqual(
      [0.05, 0.1, 0.15, 0.2, 0.25]
    )
    expect(
      touchstone.matrix![1][0].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([-30, -45, -60, -75, -90])
    // S22
    expect(touchstone.matrix![1][1].map((c) => round(abs(c), 5))).toStrictEqual(
      [0.75, 0.7, 0.65, 0.55, 0.45]
    )
    expect(
      touchstone.matrix![1][1].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([-10, -20, -30, -40, -50])
    // S23
    expect(touchstone.matrix![1][2].map((c) => round(abs(c), 5))).toStrictEqual(
      [0.02, 0.04, 0.06, 0.08, 0.1]
    )
    expect(
      touchstone.matrix![1][2].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([15, 25, 35, 45, 55])
    // S31
    expect(touchstone.matrix![2][0].map((c) => round(abs(c), 5))).toStrictEqual(
      [0.02, 0.04, 0.06, 0.08, 0.1]
    )
    expect(
      touchstone.matrix![2][0].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([45, 60, -75, -90, -105])
    // S32
    expect(touchstone.matrix![2][1].map((c) => round(abs(c), 5))).toStrictEqual(
      [0.03, 0.06, 0.09, 0.12, 0.15]
    )
    expect(
      touchstone.matrix![2][1].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([-10, -20, -30, -40, -50])
    // S33
    expect(touchstone.matrix![2][2].map((c) => round(abs(c), 5))).toStrictEqual(
      [0.7, 0.65, 0.6, 0.5, 0.4]
    )
    expect(
      touchstone.matrix![2][2].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([-5, -10, -15, -20, -25])
  })
  it('readFromString: 4-port S-parameter file, one impedance', () => {
    const string = `
      ! 4-port S-parameter data
      ! Data points are at three frequency points (non-aligned)
      ! Format: Frequency, then S-parameters in DB-Angle format, row by row

      # GHz S DB R 32

      ! -----------------------------------------------------------------------
      ! Data block starts - Frequency and S-parameter data in DB-Angle format
      ! -----------------------------------------------------------------------
      ! Frequency unit: GHz (Gigahertz)
      ! S-parameter data representation: Decibel-Angle (DB) format.
      !   Magnitude is converted to dB (Decibel = 20 * log10(Magnitude)).
      !   Angle remains in degrees.
      ! Data is arranged row-wise, for each frequency.

      5.00000     -2.92  170.0     -13.98  -30.0    -26.02  -60.0    -33.98  -90.0    ! ! Row 1 - 5.0 GHz
                  -20.00  -150.0   -2.48  160.0     -30.46  -70.0    -24.44  -80.0    ! ! Row 2 - 5.0 GHz
                  -26.02  -120.0   -30.46  -100.0   -1.94  150.0     -21.94  -50.0    ! ! Row 3 - 5.0 GHz
                  -33.98  -180.0   -24.44  -110.0   -21.94  -40.0    -1.41  140.0    ! ! Row 4 - 5.0 GHz

      6.00000     -4.44  150.37    -13.98  -35.0    -24.44  -65.0    -30.46  -95.0    ! ! Row 1 - 6.0 GHz
                  -20.00  -155.0   -3.01  150.37    -24.44  -75.0    -23.01  -85.0    ! ! Row 2 - 6.0 GHz
                  -24.44  -125.0   -27.96  -105.0   -2.51  150.37    -20.97  -55.0    ! ! Row 3 - 6.0 GHz
                  -30.46  -185.0   -23.01  -115.0   -20.97  -45.0    -1.94  150.37    ! ! Row 4 - 6.0 GHz

      7.00000     -6.02  136.69    -12.92  -40.0    -23.01  -70.0    -27.96  -100.0   ! ! Row 1 - 7.0 GHz
                  -16.44  -160.0   -3.98  136.69    -26.02  -80.0    -21.94  -90.0    ! ! Row 2 - 7.0 GHz
                  -23.01  -130.0   -26.02  -110.0   -3.01  136.69    -20.00  -60.0    ! ! Row 3 - 7.0 GHz
                  -27.96  -190.0   -21.94  -120.0   -20.00  -50.0    -2.51  136.69    ! ! Row 4 - 7.0 GHz
    `
    const touchstone = new Touchstone()
    touchstone.readFromString(string, 4)
    expect(touchstone.comments.length).toBe(11)
    expect(touchstone.comments[0]).toBe('4-port S-parameter data')
    expect(touchstone.format).toBe('DB')
    expect(touchstone.parameter).toBe('S')
    expect(touchstone.impedance).toBe(32)
    expect(touchstone.nports).toBe(4)
    expect(touchstone.frequency).toBeTruthy()
    expect(touchstone.frequency!.unit).toBe('GHz')
    expect(touchstone.frequency!.value).toStrictEqual([5, 6, 7])
    expect(touchstone.matrix).toBeTruthy()
    expect(touchstone.matrix!.length).toBe(4)
    touchstone.matrix!.forEach((array) => {
      expect(array.length).toBe(4)
      array.forEach((a) => {
        expect(a.length).toBe(3)
      })
    })
    // S11
    expect(
      touchstone.matrix![0][0].map((c: Complex) =>
        round(20 * log10(abs(c) as unknown as number), 5)
      )
    ).toStrictEqual([-2.92, -4.44, -6.02])
    expect(
      touchstone.matrix![0][0].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([170, 150.37, 136.69])
    // S12
    expect(
      touchstone.matrix![0][1].map((c) =>
        round(20 * log10(abs(c) as unknown as number), 5)
      )
    ).toStrictEqual([-13.98, -13.98, -12.92])
    expect(
      touchstone.matrix![0][1].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([-30, -35, -40])
    // S13
    expect(
      touchstone.matrix![0][2].map((c) =>
        round(20 * log10(abs(c) as unknown as number), 5)
      )
    ).toStrictEqual([-26.02, -24.44, -23.01])
    expect(
      touchstone.matrix![0][2].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([-60, -65, -70])
    // S14
    expect(
      touchstone.matrix![0][3].map((c) =>
        round(20 * log10(abs(c) as unknown as number), 5)
      )
    ).toStrictEqual([-33.98, -30.46, -27.96])
    expect(
      touchstone.matrix![0][3].map((c) => round((arg(c) / pi) * 180, 5))
    ).toStrictEqual([-90, -95, -100])
  })
  it('readFromString: 3-port S-parameter file, two impedances', () => {
    const string = `
      # Hz S RI R 23 45
      ! Freq       S11_Real    S11_Imag     S21_Real    S21_Imag     S12_Real    S12_Imag     S22_Real    S22_Imag
      ! ---------|------------|------------|------------|------------|------------|------------|------------|------------
      1.000E+06  0.9000      0.0000      0.0100      -0.0200     -0.0200     0.0100      0.9000      0.0000
      2.000E+06  0.8000      0.0000      0.0200      -0.0400     -0.0400     0.0200      0.8000      0.0000
      3.000E+06  0.7000      0.0000      0.0300      -0.0600     -0.0600     0.0300      0.7000      0.0000
      4.000E+06  0.6000      0.0000      0.0400      -0.0800     -0.0800     0.0400      0.6000      0.0000
      5.000E+06  0.5000      0.0000      0.0500      -0.1000     -0.1000     0.0500      0.5000      0.0000
    `
    const touchstone = new Touchstone()
    touchstone.readFromString(string, 2)
    expect(touchstone.comments.length).toBe(2)
    expect(touchstone.format).toBe('RI')
    expect(touchstone.parameter).toBe('S')
    expect(touchstone.impedance).toStrictEqual([23, 45])
    expect(touchstone.nports).toBe(2)
    expect(touchstone.frequency).toBeTruthy()
    expect(touchstone.frequency!.unit).toBe('Hz')
    expect(touchstone.frequency!.value).toStrictEqual([1e6, 2e6, 3e6, 4e6, 5e6])
    expect(touchstone.matrix).toBeTruthy()
    expect(touchstone.matrix!.length).toBe(2)
    touchstone.matrix!.forEach((array) => {
      expect(array.length).toBe(2)
      array.forEach((a) => {
        expect(a.length).toBe(5)
      })
    })
    // S11
    expect(touchstone.matrix![0][0].map((c) => round(c.re, 5))).toStrictEqual([
      0.9, 0.8, 0.7, 0.6, 0.5,
    ])
    expect(touchstone.matrix![0][0].map((c) => round(c.im, 5))).toStrictEqual([
      0, 0, 0, 0, 0,
    ])
    // S12
    expect(touchstone.matrix![0][1].map((c) => round(c.re, 5))).toStrictEqual([
      -0.02, -0.04, -0.06, -0.08, -0.1,
    ])
    expect(touchstone.matrix![0][1].map((c) => round(c.im, 5))).toStrictEqual([
      0.01, 0.02, 0.03, 0.04, 0.05,
    ])
    // S21
    expect(touchstone.matrix![1][0].map((c) => round(c.re, 5))).toStrictEqual([
      0.01, 0.02, 0.03, 0.04, 0.05,
    ])
    expect(touchstone.matrix![1][0].map((c) => round(c.im, 5))).toStrictEqual([
      -0.02, -0.04, -0.06, -0.08, -0.1,
    ])
    // S22
    expect(touchstone.matrix![1][1].map((c) => round(c.re, 5))).toStrictEqual([
      0.9, 0.8, 0.7, 0.6, 0.5,
    ])
    expect(touchstone.matrix![1][1].map((c) => round(c.im, 5))).toStrictEqual([
      0, 0, 0, 0, 0,
    ])
  })
  // Generate touchstone string using Scikit-RF, then test readFromString
  // for (const format of TouchstoneFormats) {
  //   for (const parameter of TouchstoneParameters) {
  //     for (const impedance of [undefined, 'one', 'multiple']) {
  //       for (const nports of [1, 2, 3, 4, 5, 9, 15]) {
  //         for (const unit of FrequencyUnits) {
  //           console.log(format, parameter, impedance, nports, unit)
  //         }
  //       }
  //     }
  //   }
  // }
})
