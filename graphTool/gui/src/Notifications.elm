module Notifications exposing (Model, init)

import Notification


type alias Model =
    List Notification.Model


init : Model
init =
    []
