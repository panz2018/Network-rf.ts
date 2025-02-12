import { Frequency } from './frequency'
import { Complex } from 'mathjs'

/**
 * S-parameter format: MA, DB, and RI
 * - RI: real and imaginary, i.e. $A + j \cdot B$
 * - MA: magnitude and angle (in degrees), i.e. $A \cdot e^{j \cdot {\pi \over 180} \cdot B }$
 * - DB: decibels and angle (in degrees), i.e. $10^{A \over 20} \cdot e^{j \cdot {\pi \over 180} \cdot B}$
 */
export const TouchstoneFormats = ['RI', 'MA', 'DB'] as const

/**
 * S-parameter format: MA, DB, and RI
 */
export type TouchstoneFormat = (typeof TouchstoneFormats)[number]

/**
 * Type of network parameters
 * - S: Scattering parameters
 * - Y: Admittance parameters
 * - Z: Impedance parameters
 * - H: Hybrid-h parameters
 * - G: Hybrid-g parameters
 */
export const TouchstoneParameters = ['S', 'Y', 'Z', 'G', 'H']

/**
 * Type of network parameters: 'S' | 'Y' | 'Z' | 'G' | 'H'
 */
export type TouchstoneParameter = (typeof TouchstoneParameters)[number]

/**
 * The reference resistance(s) for the network parameters.
 * For Touchstone 1.0, this is a single value for all ports.
 * For Touchstone 1.1, this can be an array of values (one per port)
 */
export type TouchstoneResistance = number | number[]

/**
 * The data of touchstone file
 * A three dimensional matrix
 * - The first dimension is the exits (output) port number
 * - The second dimension is the enters (input) port number
 * - The third dimension is the frequency index
 */
export type TouchstoneMatrix = Complex[][][]

/**
 * Touchstone class supports both reading (parsing) and writing (generating) touchstone files.
 * Only version 1.0 and 1.1 are supported
 *
 * ## Overview
 *
 * The **Touchstone file format** (also known as `.snp` files) is an industry-standard ASCII text format used to represent the n-port network parameters of electrical circuits. These files are commonly used in RF and microwave engineering to describe the behavior of devices such as filters, amplifiers, and interconnects.
 *
 * A Touchstone file contains data about network parameters (e.g., S-parameters, Y-parameters, Z-parameters) at specific frequencies.
 *
 * ### Key Features:
 * - **File Extensions**: Traditionally, Touchstone files use extensions like `.s1p`, `.s2p`, `.s3p`, etc., where the number indicates the number of ports. For example, `.s2p` represents a 2-port network.
 * - **Case Insensitivity**: Touchstone files are case-insensitive, meaning keywords and values can be written in uppercase or lowercase.
 * - **Versioning**: **Only version 1.0 and 1.1 are supported in this class**
 *
 * ---
 *
 * ## File Structure
 *
 * A Touchstone file consists of several sections, each serving a specific purpose. Below is a breakdown of the structure:
 *
 * ### 1. Header Section
 *
 * - **Comment Lines**: Lines starting with `!` are treated as comments and ignored during parsing.
 * - **Option Line**: Defines global settings for the file, such as frequency units, parameter type, and data format. Example:
 *   ```
 *   # GHz S MA R 50
 *   ```
 *   - `GHz`: Frequency unit (can be `Hz`, `kHz`, `MHz`, or `GHz`).
 *   - `S`: Parameter type (`S`, `Y`, `Z`, `H`, or `G`).
 *   - `MA`: Data format (`MA` for magnitude-angle, `DB` for decibel-angle, or `RI` for real-imaginary).
 *   - `R 50`: Reference resistance in ohms (default is 50 ohms if omitted).
 *
 * ### 2. Network Data
 *
 * The core of the file contains the network parameter data, organized by frequency. Each frequency point is followed by its corresponding parameter values.
 *
 * - **Single-Ended Networks**: Data is arranged in a matrix format. For example, a 2-port network might look like this:
 *   ```
 *   <frequency> <N11> <N21> <N12> <N22>
 *   ```
 *
 * ---
 *
 * ## Examples
 *
 * ### Example 1: Simple 1-Port S-Parameter File
 * ```plaintext
 * ! 1-port S-parameter file
 * # MHz S MA R 50
 * 100 0.99 -4
 * 200 0.80 -22
 * 300 0.707 -45
 * ```
 *
 * ---
 *
 * ## References:
 * - {@link https://ibis.org/touchstone_ver2.1/touchstone_ver2_1.pdf Touchstone(R) File Format Specification (Version 2.1)}
 * - {@link https://books.google.com/books/about/S_Parameters_for_Signal_Integrity.html?id=_dLKDwAAQBAJ S-Parameters for Signal Integrity}
 * - {@link https://github.com/scikit-rf/scikit-rf/blob/master/skrf/io/touchstone.py scikit-rf: Open Source RF Engineering}
 * - {@link https://github.com/Nubis-Communications/SignalIntegrity/blob/master/SignalIntegrity/Lib/SParameters/SParameters.py SignalIntegrity: Signal and Power Integrity Tools}
 */
export class Touchstone {
  /**
   * Comments in the file header with "!" symbol at the beginning of each row
   */
  public comments = ''

  /**
   * S-parameter format: MA, DB, and RI
   */
  private format: TouchstoneFormat | undefined

  /**
   * Type of network parameters: 'S' | 'Y' | 'Z' | 'G' | 'H'
   */
  private parameter: TouchstoneParameter | undefined

  /**
   * Reference impedance(s) for the network parameters
   */
  private resistance: TouchstoneResistance = 50

  /**
   * The number of ports in the network.
   */
  private nports: number | undefined

  /**
   * Frequency points
   */
  private frequency: Frequency | undefined

  /**
   * 2D matrix of complex number in TouchStone file
   */
  private matrix: TouchstoneMatrix = []

  public read_text(text: string) {
    console.log(text)
    console.log(
      this.comments,
      this.format,
      this.parameter,
      this.resistance,
      this.nports,
      this.frequency,
      this.matrix
    )
  }
}
