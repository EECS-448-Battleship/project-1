/**
 * Placeholder class for an error that is thrown when a ship is placed
 * in an invalid position.
 * @extends Error
 */
export class InvalidShipPlacementError extends Error {}

/**
 * Error thrown when the program tries to advance the state, but it is
 * invalid.
 * @extends Error
 */
export class InvalidAdvanceStateError extends Error {}

/**
 * Error thrown when a missile is fired at an invalid cell.
 * @extends Error
 */
export class InvalidMissileFireAttemptError extends Error {}
