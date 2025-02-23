export enum PlayerPickerCaller {
    NONE,
    SYNC,
    PLAY_PAUSE,
    FORWARD,
    REWIND
}

export type GlobalSettings = {
    playerPickerCaller: PlayerPickerCaller;
}