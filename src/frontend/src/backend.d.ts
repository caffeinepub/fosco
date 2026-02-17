import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type SignalMessage = {
    __kind__: "screenShareStop";
    screenShareStop: null;
} | {
    __kind__: "iceCandidate";
    iceCandidate: string;
} | {
    __kind__: "offer";
    offer: string;
} | {
    __kind__: "screenShareRequest";
    screenShareRequest: null;
} | {
    __kind__: "answer";
    answer: string;
};
export interface UserProfile {
    displayName: string;
    phoneNumber: string;
}
export type CallStatus = {
    __kind__: "incoming";
    incoming: {
        caller: Principal;
    };
} | {
    __kind__: "none";
    none: null;
} | {
    __kind__: "inCall";
    inCall: {
        screenCaster?: Principal;
        callee: Principal;
        caller: Principal;
        isScreenCasting: boolean;
    };
};
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / This function allows the callee to accept an incoming call.
     * / It will update both caller and callee to the `inCall` state if the call is valid.
     */
    answerCall(arg0: null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearSignals(arg0: null): Promise<void>;
    /**
     * / Decline an incoming call. This will always transition the call state to none.
     */
    declineCall(arg0: null): Promise<void>;
    disableScreenCast(arg0: null): Promise<void>;
    enableScreenCast(arg0: null): Promise<void>;
    endCall(arg0: null): Promise<void>;
    fetchSignals(arg0: null): Promise<Array<SignalMessage>>;
    getCallStatus(arg0: null): Promise<CallStatus>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPrincipalFromPhoneNumber(phoneNumber: string): Promise<Principal>;
    getUserByPhoneNumber(phoneNumber: string): Promise<UserProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initiateCall(callee: Principal): Promise<void>;
    isAvailable(principal: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendSignal(target: Principal, message: SignalMessage): Promise<void>;
    setAvailable(arg0: null): Promise<void>;
    setUnavailable(arg0: null): Promise<void>;
}
