export enum PlayerPickerCaller {
    NONE,
    PLAY_PAUSE,
    FORWARD,
    REWIND
}

export type GlobalSettings = {
    playerPickerCaller: PlayerPickerCaller;
}