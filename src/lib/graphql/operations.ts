import { gql } from '@apollo/client'

// ─── Auth ────────────────────────────────────────────────────────────────────

export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      token
      user {
        id name age bio imageUrl gender line
        height bodyType preferredLine preferredMeetingArea
        frequentStation firstDateStation randomMatchEnabled
      }
      errors
    }
  }
`

export const SIGN_UP = gql`
  mutation SignUp($email: String!, $password: String!, $name: String!, $age: Int!, $gender: String!) {
    signUp(input: { email: $email, password: $password, name: $name, age: $age, gender: $gender }) {
      token
      user { id name age bio imageUrl gender line }
      errors
    }
  }
`

export const ME = gql`
  query Me {
    me {
      id name age bio imageUrl gender line
      height bodyType preferredLine preferredMeetingArea
      frequentStation firstDateStation randomMatchEnabled distanceKm
      communityIds
      userImages { id imageUrl position }
    }
  }
`

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $name: String
    $bio: String
    $age: Int
    $gender: String
    $height: Int
    $bodyType: String
    $line: String
    $preferredLine: String
    $preferredMeetingArea: String
    $frequentStation: String
    $firstDateStation: String
    $imageUrl: String
    $randomMatchEnabled: Boolean
  ) {
    updateProfile(input: {
      name: $name bio: $bio age: $age gender: $gender
      height: $height bodyType: $bodyType line: $line
      preferredLine: $preferredLine preferredMeetingArea: $preferredMeetingArea
      frequentStation: $frequentStation firstDateStation: $firstDateStation
      imageUrl: $imageUrl randomMatchEnabled: $randomMatchEnabled
    }) {
      user {
        id name age bio imageUrl gender line
        height bodyType preferredLine preferredMeetingArea
        frequentStation firstDateStation randomMatchEnabled
      }
      errors
    }
  }
`

export const ADD_USER_IMAGE = gql`
  mutation AddUserImage($imageUrl: String!) {
    addUserImage(input: { imageUrl: $imageUrl }) {
      userImage { id imageUrl position }
      errors
    }
  }
`

export const DELETE_USER_IMAGE = gql`
  mutation DeleteUserImage($id: ID!) {
    deleteUserImage(input: { id: $id }) {
      errors
    }
  }
`

// ─── Communities ─────────────────────────────────────────────────────────────

export const COMMUNITIES = gql`
  query Communities {
    communities {
      id name tag description iconClass memberCount
    }
  }
`

export const JOIN_COMMUNITY = gql`
  mutation JoinCommunity($communityId: ID!) {
    joinCommunity(input: { communityId: $communityId }) {
      errors
    }
  }
`

export const LEAVE_COMMUNITY = gql`
  mutation LeaveCommunity($communityId: ID!) {
    leaveCommunity(input: { communityId: $communityId }) {
      errors
    }
  }
`

// ─── Matching ─────────────────────────────────────────────────────────────────

export const CANDIDATES = gql`
  query Candidates {
    candidates {
      id name age bio imageUrl line communityIds distanceKm
      sentLikeCount sentSkipCount firstDateStation bodyType
    }
  }
`

export const RECEIVED_LIKES = gql`
  query ReceivedLikes {
    receivedLikes {
      id name age bio imageUrl line communityIds distanceKm
      sentLikeCount sentSkipCount firstDateStation bodyType
    }
  }
`

export const MATCHES = gql`
  query Matches {
    matches {
      id
      partner { id name age bio imageUrl line communityIds distanceKm sentLikeCount sentSkipCount firstDateStation bodyType }
      matchedAt
    }
  }
`

export const SWIPE_USER = gql`
  mutation SwipeUser($toUserId: ID!, $action: String!) {
    swipeUser(input: { toUserId: $toUserId, action: $action }) {
      matched
      errors
    }
  }
`

// ─── Messaging ────────────────────────────────────────────────────────────────

export const MESSAGES = gql`
  query Messages($partnerId: ID!) {
    messages(partnerId: $partnerId) {
      id text fromMe timestamp
    }
  }
`

export const SEND_MESSAGE = gql`
  mutation SendMessage($receiverId: ID!, $body: String!) {
    sendMessage(input: { receiverId: $receiverId, body: $body }) {
      message { id text fromMe timestamp }
      errors
    }
  }
`
