import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type UserProfile = {
    phoneNumber : Text;
    displayName : Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    callStates : Map.Map<Principal, {
      #none;
      #incoming;
      #inCall : {
        caller : Principal;
        callee : Principal;
        isScreenCasting : Bool;
        screenCaster : ?Principal;
      };
    }>;
    pendingSignals : Map.Map<Principal, List.List<{
      #offer : Text;
      #answer : Text;
      #iceCandidate : Text;
      #screenShareRequest;
      #screenShareStop;
    }>>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    phoneToPrincipal : Map.Map<Text, Principal>;
    callStates : Map.Map<Principal, {
      #none;
      #incoming;
      #inCall : {
        caller : Principal;
        callee : Principal;
        isScreenCasting : Bool;
        screenCaster : ?Principal;
      };
    }>;
    pendingSignals : Map.Map<Principal, List.List<{
      #offer : Text;
      #answer : Text;
      #iceCandidate : Text;
      #screenShareRequest;
      #screenShareStop;
    }>>;
  };

  public func run(old : OldActor) : NewActor {
    let phoneToPrincipal = Map.empty<Text, Principal>();

    // Populate phoneToPrincipal map from existing userProfiles
    for ((principal, profile) in old.userProfiles.entries()) {
      phoneToPrincipal.add(profile.phoneNumber, principal);
    };

    { old with phoneToPrincipal };
  };
};
