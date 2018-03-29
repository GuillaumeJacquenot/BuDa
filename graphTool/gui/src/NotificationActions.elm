module NotificationActions exposing (header, updateNotificationModel)

import Notifications exposing (Model)
import DataModelDecoders
import Json.Decode


header : String -> String -> String -> String
header userName object action =
    userName ++ "." ++ object ++ "." ++ action


updateNotificationModel : String -> Notifications.Model -> Notifications.Model
updateNotificationModel s list =
    list
