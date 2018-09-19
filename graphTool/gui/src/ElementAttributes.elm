module ElementAttributes exposing (..)

import Identifier exposing (Identifier)


type alias Roles =
    List NetworkRole


type alias NetworkRole =
    { network : Identifier
    , role : Role
    }


type Role
    = Producer
    | Consumer
    | ProducerConsumer
    | RoleUnknown


type ElementState
    = RAS
    | HS
    | StateUnknown
