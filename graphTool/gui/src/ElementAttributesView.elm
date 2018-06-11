module ElementAttributesView exposing (..)

import ElementAttributes exposing (..)
import Html exposing (Html, Attribute, button, div, fieldset, input, label, span, text, textarea)
import Html.Attributes exposing (id, name, style, type_, value, placeholder, class, checked)
import Html.Events exposing (onClick, on, onInput)
import Messages
import DataModel
import Model exposing (Model)
import Node exposing (Node)
import Link exposing (Edge)


radio : String -> msg -> String -> Bool -> Html msg
radio s msg value b =
    label
        [ style [ ( "padding", "5px" ) ]
        ]
        [ input [ type_ "radio", name s, onClick msg, checked b ] []
        , text value
        ]


typeFieldset : ElementType -> Html Messages.Msg
typeFieldset nodeType =
    fieldset [ id "elementType" ]
        [ radio "elemType" (Messages.SwitchElemType Producer) "Producer" (nodeType == Producer)
        , radio "elemType" (Messages.SwitchElemType Consumer) "Consumer" (nodeType == Consumer)
        ]


stateFieldset : ElementState -> Html Messages.Msg
stateFieldset state =
    fieldset [ id "elementState" ]
        [ radio "elemState" (Messages.SwitchElemState RAS) "RAS" (state == RAS)
        , radio "elemState" (Messages.SwitchElemState HS) "HS" (state == HS)
        ]


getFieldsetNode : Maybe Node -> Html Messages.Msg
getFieldsetNode node =
    case node of
        Nothing ->
            div [] []

        Just x ->
            div []
                [ typeFieldset x.nodeType
                , stateFieldset x.state
                ]


getFieldsetEdge : Maybe Edge -> Html Messages.Msg
getFieldsetEdge edge =
    case edge of
        Nothing ->
            div [] []

        Just x ->
            div []
                [ stateFieldset x.state ]


expose : Model -> Html Messages.Msg
expose model =
    let
        m_id =
            case model.selection of
                x :: xs ->
                    Just x

                [] ->
                    Nothing

        m_node =
            case m_id of
                Nothing ->
                    Nothing

                Just x ->
                    DataModel.getNodeFromId x model.dataModel.nodes

        m_edge =
            case m_id of
                Nothing ->
                    Nothing

                Just x ->
                    DataModel.getEdgeFromId x model.dataModel.edges
    in
        div []
            [ getFieldsetNode m_node
            , getFieldsetEdge m_edge
            ]


view : Model.Model -> Html Messages.Msg
view model =
    div [ class "div-element-type" ]
        [ expose model ]



--     [ fieldset [ id "elementType" ]
--         [ radio "elemType" (Messages.SwitchElemType Producer) "Producer" False
--         , radio "elemType" (Messages.SwitchElemType Consumer) "Consumer" False
--         ]
--     , fieldset [ id "elementState" ]
--         [ radio "elemState" (Messages.SwitchElemState RAS) "RAS" True
--         , radio "elemState" (Messages.SwitchElemState HS) "HS" False
--         ]
--     ]
