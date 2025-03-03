export enum PlayerPickerCaller {
    NONE,
    SYNC,
    PLAY_PAUSE,
    FORWARD,
    REWIND,
    SPEEDOMETER,
    HEADER,
    FULLSCREEN,
    ALWAYS_ON_TOP,
    MUTE,
    VOLUME_UP,
    VOLUME_DOWN,
    SWAP_ONE,
    SWAP_TWO
}

export type GlobalSettings = {
    playerPickerCaller: PlayerPickerCaller;
}

export enum PlayerPickerDisplay {
    ALL,
    ONBOARDS_ONLY
}

export const NON_OBC_POSSIBLE_STREAMS = ["INTERNATIONAL", "F1 LIVE", "TRACKER", "DATA"];