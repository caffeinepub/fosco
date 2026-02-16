import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";

module {
  // Old types
  type OldCallStatus = {
    #none;
    #incoming;
    #inCall : {
      caller : Principal;
      callee : Principal;
      isScreenCasting : Bool;
      screenCaster : ?Principal;
    };
  };

  type OldSignalMessage = {
    #offer : Text;
    #answer : Text;
    #iceCandidate : Text;
    #screenShareRequest;
    #screenShareStop;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { phoneNumber : Text; displayName : Text }>;
    phoneToPrincipal : Map.Map<Text, Principal>;
    callStates : Map.Map<Principal, OldCallStatus>;
    pendingSignals : Map.Map<Principal, List.List<OldSignalMessage>>;
  };

  // New types
  type NewCallStatus = {
    #none;
    #incoming : { caller : Principal };
    #inCall : {
      caller : Principal;
      callee : Principal;
      isScreenCasting : Bool;
      screenCaster : ?Principal;
    };
  };

  type NewSignalMessage = {
    #offer : Text;
    #answer : Text;
    #iceCandidate : Text;
    #screenShareRequest;
    #screenShareStop;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { phoneNumber : Text; displayName : Text }>;
    phoneToPrincipal : Map.Map<Text, Principal>;
    callStates : Map.Map<Principal, NewCallStatus>;
    pendingSignals : Map.Map<Principal, List.List<NewSignalMessage>>;
  };

  public func run(old : OldActor) : NewActor {
    let newCallStates = old.callStates.map<Principal, OldCallStatus, NewCallStatus>(
      func(_principal, status) {
        switch (status) {
          case (#none) { #none };
          case (#incoming) { #none };
          case (#inCall(data)) { #inCall(data) };
        };
      }
    );
    {
      old with
      callStates = newCallStates
    };
  };
};
