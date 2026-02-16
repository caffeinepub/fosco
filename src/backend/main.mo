import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    phoneNumber : Text;
    displayName : Text;
  };

  // Call state types
  public type CallStatus = {
    #none;
    #incoming : { caller : Principal };
    #inCall : {
      caller : Principal;
      callee : Principal;
      isScreenCasting : Bool;
      screenCaster : ?Principal;
    };
  };

  // Signaling message types
  public type SignalMessage = {
    #offer : Text;
    #answer : Text;
    #iceCandidate : Text;
    #screenShareRequest;
    #screenShareStop;
  };

  // State storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let phoneToPrincipal = Map.empty<Text, Principal>();
  let callStates = Map.empty<Principal, CallStatus>();
  let pendingSignals = Map.empty<Principal, List.List<SignalMessage>>();

  // Profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    userProfiles.add(caller, profile);
    phoneToPrincipal.add(profile.phoneNumber, caller);
  };

  public shared ({ caller }) func getPrincipalFromPhoneNumber(phoneNumber : Text) : async Principal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can lookup by phone number");
    };
    switch (phoneToPrincipal.get(phoneNumber)) {
      case (?principal) { principal };
      case (null) { Runtime.trap("Number " # phoneNumber # " not registered!") };
    };
  };

  public query ({ caller }) func getUserByPhoneNumber(phoneNumber : Text) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can lookup by phone number");
    };
    userProfiles.values().find(
      func(profile) { profile.phoneNumber == phoneNumber }
    );
  };

  // Presence management
  public shared ({ caller }) func setAvailable(_ : ()) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set presence");
    };
    callStates.add(caller, #none);
  };

  public shared ({ caller }) func setUnavailable(_ : ()) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set presence");
    };
    callStates.remove(caller);
  };

  public query ({ caller }) func isAvailable(principal : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check availability");
    };
    callStates.get(principal) != null;
  };

  // Call initiation
  public shared ({ caller }) func initiateCall(callee : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can initiate calls");
    };
    if (callStates.get(callee) == null) {
      Runtime.trap("Callee is not available");
    };

    callStates.add(
      callee,
      #incoming { caller },
    );
    callStates.add(
      caller,
      #inCall({
        caller;
        callee;
        isScreenCasting = false;
        screenCaster = null;
      }),
    );
  };

  public shared ({ caller }) func answerCall(_ : ()) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can answer calls");
    };

    switch (callStates.get(caller)) {
      case (?(#incoming { caller = callInitiator })) {
        // Verify the call initiator still has an active outgoing call to this callee
        switch (callStates.get(callInitiator)) {
          case (?(#inCall { caller = storedCaller; callee = storedCallee; isScreenCasting; screenCaster })) {
            // Verify the authenticated caller is the intended callee
            if (storedCallee != caller) {
              Runtime.trap("Unauthorized: You are not the callee of this call");
            };
            // Verify call state consistency
            if (storedCaller != callInitiator) {
              Runtime.trap("Invalid call state: caller mismatch");
            };

            // Update both participants to inCall state
            callStates.add(
              caller,
              #inCall({ caller = callInitiator; callee = caller; isScreenCasting; screenCaster }),
            );
            callStates.add(
              callInitiator,
              #inCall({ caller = callInitiator; callee = caller; isScreenCasting; screenCaster }),
            );
          };
          case (_) { Runtime.trap("Invalid call state: initiator not in call") };
        };
      };
      case (_) { Runtime.trap("No incoming call to answer") };
    };
  };

  public shared ({ caller }) func endCall(_ : ()) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can end calls");
    };
    switch (callStates.get(caller)) {
      case (?(#inCall { caller = callInitiator; callee })) {
        // Verify the authenticated caller is a participant in this call
        if (caller != callInitiator and caller != callee) {
          Runtime.trap("Unauthorized: You are not a participant in this call");
        };
        callStates.add(callInitiator, #none);
        callStates.add(callee, #none);
      };
      case (?(#incoming { caller = callInitiator })) {
        // Allow declining an incoming call
        // Verify the authenticated caller is the callee
        callStates.add(caller, #none);
        // Also clean up the initiator's state
        switch (callStates.get(callInitiator)) {
          case (?(#inCall { callee = storedCallee })) {
            if (storedCallee == caller) {
              callStates.add(callInitiator, #none);
            };
          };
          case (_) {};
        };
      };
      case (_) { Runtime.trap("No active call to end") };
    };
  };

  // Signaling (offer/answer/ICE)
  public shared ({ caller }) func sendSignal(target : Principal, message : SignalMessage) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send signals");
    };

    // Verify caller is in a call with the target
    var isAuthorized = false;
    switch (callStates.get(caller)) {
      case (?(#inCall { caller = callInitiator; callee })) {
        if (target == callInitiator or target == callee) {
          isAuthorized := true;
        };
      };
      case (?(#incoming { caller = callInitiator })) {
        // Allow signaling during incoming call setup
        if (target == callInitiator) {
          isAuthorized := true;
        };
      };
      case (_) {};
    };

    // Also check if target has caller in their call state
    if (not isAuthorized) {
      switch (callStates.get(target)) {
        case (?(#inCall { caller = callInitiator; callee })) {
          if (caller == callInitiator or caller == callee) {
            isAuthorized := true;
          };
        };
        case (?(#incoming { caller = callInitiator })) {
          if (caller == callInitiator) {
            isAuthorized := true;
          };
        };
        case (_) {};
      };
    };

    if (not isAuthorized) {
      Runtime.trap("Unauthorized: Can only send signals to call participants");
    };

    if (pendingSignals.containsKey(target)) {
      switch (pendingSignals.get(target)) {
        case (null) {};
        case (?messages) {
          messages.add(message);
          pendingSignals.add(target, messages);
        };
      };
    } else {
      let messages = List.empty<SignalMessage>();
      messages.add(message);
      pendingSignals.add(target, messages);
    };
  };

  public query ({ caller }) func fetchSignals(_ : ()) : async [SignalMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch signals");
    };
    switch (pendingSignals.get(caller)) {
      case (null) { [] };
      case (?messages) { messages.toArray() };
    };
  };

  public shared ({ caller }) func clearSignals(_ : ()) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear signals");
    };
    pendingSignals.remove(caller);
  };

  // Screen sharing
  public shared ({ caller }) func enableScreenCast(_ : ()) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can enable screen casting");
    };
    switch (callStates.get(caller)) {
      case (?(#inCall { caller = callInitiator; callee; isScreenCasting; screenCaster })) {
        // Verify the authenticated caller is a participant
        if (caller != callInitiator and caller != callee) {
          Runtime.trap("Unauthorized: You are not a participant in this call");
        };
        if (isScreenCasting) {
          Runtime.trap("Screen casting already in progress");
        };
        callStates.add(
          callInitiator,
          #inCall({
            caller = callInitiator;
            callee;
            isScreenCasting = true;
            screenCaster = ?caller;
          }),
        );
        callStates.add(
          callee,
          #inCall({
            caller = callInitiator;
            callee;
            isScreenCasting = true;
            screenCaster = ?caller;
          }),
        );
      };
      case (_) { Runtime.trap("Not in active call") };
    };
  };

  public shared ({ caller }) func disableScreenCast(_ : ()) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can disable screen casting");
    };
    switch (callStates.get(caller)) {
      case (?(#inCall { caller = callInitiator; callee; isScreenCasting = true; screenCaster })) {
        // Verify the authenticated caller is a participant
        if (caller != callInitiator and caller != callee) {
          Runtime.trap("Unauthorized: You are not a participant in this call");
        };
        if (screenCaster != ?caller) {
          Runtime.trap("Only the screen caster can stop screen casting");
        };
        callStates.add(
          callInitiator,
          #inCall({
            caller = callInitiator;
            callee;
            isScreenCasting = false;
            screenCaster = null;
          }),
        );
        callStates.add(
          callee,
          #inCall({
            caller = callInitiator;
            callee;
            isScreenCasting = false;
            screenCaster = null;
          }),
        );
      };
      case (_) { Runtime.trap("No active screen cast to end") };
    };
  };

  public query ({ caller }) func getCallStatus(_ : ()) : async CallStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get call status");
    };
    switch (callStates.get(caller)) {
      case (null) { #none };
      case (?status) { status };
    };
  };
};
