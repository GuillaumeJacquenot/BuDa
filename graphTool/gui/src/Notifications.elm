module Notifications exposing (Model, defaultModel)

import Notification


type alias Model =
    List Notification.Model


defaultModel : Model
defaultModel =
    []
