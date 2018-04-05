module Notification
    exposing
        ( Model
        , NotificationData(..)
        , notification
        )

import Node exposing (Node)
import Link exposing (Edge)
import LinkParameters
import Groups


type NotificationData
    = BLOC Node
    | LIEN Edge
    | PARAMETER LinkParameters.Property
    | FUNCIONAL_CHAIN Groups.Property
    | NULLNOTIFICATION


type alias Model =
    { header : String
    , data : NotificationData
    }


notification : String -> NotificationData -> Model
notification s notifyData =
    { header = s
    , data = notifyData
    }
