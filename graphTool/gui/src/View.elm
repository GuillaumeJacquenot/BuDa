module View exposing (init, view)

import Messages
import Html exposing (Html, Attribute, button, div, fieldset, input, label, span, text, section, img)
import Html.Attributes exposing (id, name, style, type_, checked, value, placeholder, class, accept, src, title)
import Html.Events exposing (onClick, on, onInput)
import Json.Decode
import Model exposing (ViewType(..))
import ParametersView
import AttributView
import ElementAttributesView
import GroupsView
import ModelActions
import GeometriesView
import LayoutView
import Mqtt


init : ( Model.Model, Cmd Messages.Msg )
init =
    ( Model.defaultModel, Cmd.none )


onInputFile : msg -> Html.Attribute msg
onInputFile message =
    on "change" (Json.Decode.succeed message)


radio : String -> msg -> String -> Bool -> Html msg
radio s msg value b =
    label
        [ style [ ( "padding", "5px" ) ]
        ]
        [ input [ type_ "radio", name s, onClick msg, checked b ] []
        , text value
        ]


{-| Main application
-}
view : Model.Model -> Html Messages.Msg
view model =
    div []
        [ div []
            [ fieldset [ id "fieldset" ]
                [ radio "viewType" (Messages.SwitchToView Model.BULL) "Bubble Diagram" (model.viewType == Model.BULL)
                , radio "viewType" (Messages.SwitchToView Model.PBS) "PBS" (model.viewType == Model.PBS)
                , radio "viewType" (Messages.SwitchToView Model.ALL) "All" (model.viewType == Model.ALL)
                , radio "viewType" (Messages.SwitchToView Model.ALL_LIGHT) "Flat" (model.viewType == Model.ALL_LIGHT)
                , radio "viewType" (Messages.SwitchToView Model.GEOMETRY) "Geometry" (model.viewType == Model.GEOMETRY)
                ]
            ]
        , button [ onClick Messages.CreateNode, id "new", value "new element" ] [ text "Block" ]
        , button [ onClick Messages.CreateLink, id "edge", value "edge" ] [ text "Link" ]
        , button [ onClick Messages.RenameNode, id "rename", value "rename" ] [ text "Name" ]
        , LayoutView.view model
        , div [ id "leftLayout", class "vLayout" ]
            [ AttributView.view model
            , ElementAttributesView.view model
            , ParametersView.view model
            , GroupsView.view model
            , GeometriesView.view model
            ]
          -- , button [ onClick Actions.ParametersDialog, id "dialog", value "dialog" ] [ text "dialog" ]
        , button [ onClick Messages.ExportLink, id "export", value "export" ] [ text "Export" ]
        , input [ onInput Messages.InputChange, id "input", placeholder "undefined" ] []
        , input [ onInput Messages.InputFileChange, id "inputFile", placeholder "undefined" ] []
        , button [ onClick Messages.SaveModel, id "saveModel", value "saveModel" ] [ text "Save" ]
        , input [ onInputFile Messages.LoadModel, id model.loadModelId, type_ "file", accept ".json,.csv" ] []
        , input [ onInputFile Messages.ImportModel, id "importModel", type_ "file", accept ".json,.csv" ] []
        , input [ onInputFile Messages.LoadGeometry, id "loadGeometry", type_ "file", accept ".svg" ] []
        , button [ onClick Messages.SaveToImage, id "png", value "png" ] [ text "Print" ]
        , button [ onClick Messages.OnOpen, id "open", value "open" ] [ text "Open" ]
        , button [ onClick Messages.OnImport, id "import", value "import" ] [ text "Import" ]
        , button [ onClick Messages.AskForMessages, id "ask", value "ask" ] [ text "GetMsg" ]
        , button [ onClick Messages.Undo, id "undo", value "undo" ] [ text "Undo" ]
        , button [ onClick Messages.GroupNodes, id "group", value "group" ] [ text "Group" ]
        , button [ onClick Messages.UpdateTightness, id "Tight", value "Tight" ] [ text "Tight" ]
        , button [ onClick Messages.Layout, id "layout", value "layout" ] [ text "Layout" ]
        , button [ onClick Messages.GetPositions, id "pos", value "pos" ] [ text "Pos" ]
        , button [ onClick Messages.Redo, id "redo", value "redo" ] [ text "Redo" ]
        , button [ onClick Messages.Verification, id "verification", value "verification" ] [ text "Verif" ]
        , img [ id "logo", src "LogoSirehna_DC.png", title "logo sirehna" ] []
        , div [ id "label" ] [ text (ModelActions.getNodeViewLabel model) ]
        , div [ id "counter" ] [ text (ModelActions.getCounterViewLabel model) ]
        , button
            [ onClick Messages.OnNotificationClick
            , id "notification"
            , value "notification"
            , style
                [ ( "visibility"
                  , case (List.isEmpty model.dataModel.receivedNotifications) of
                        True ->
                            "hidden"

                        False ->
                            "visible"
                  )
                ]
            ]
            [ text "Notifications" ]
        , input [ onInput Messages.UserChange, id "userInput", placeholder model.mqtt.clientId ] []
        , input [ onInput Messages.UrlChange, id "urlInput", placeholder model.mqtt.url ] []
        , button [ onClick Messages.MqttConnect, id "mqttConnect", value "mqttConnect" ] [ text "Connect" ]
        , button [ onClick Messages.MqttDisconnect, id "mqttDisconnect", value "mqttDisconnect" ] [ text "Disconnect" ]
        ]
