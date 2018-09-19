module ElementAttributesView exposing (view)

import ElementAttributes exposing (..)
import Html exposing (Html, Attribute, button, div, fieldset, input, label, span, text, textarea, p, legend)
import Html.Attributes exposing (id, name, style, type_, value, placeholder, class, checked)
import Html.Events exposing (onClick, on, onInput)
import Messages
import DataModel
import Model exposing (Model)
import Node exposing (Node)
import Link exposing (Edge)
import Identifier exposing (Identifier)
import LinkParameters exposing (getPropertyNameFromId)


radio : String -> Messages.Msg -> String -> Bool -> Html Messages.Msg
radio s msg value b =
    label
        [ class "role-network" ]
        [ input [ type_ "radio", name s, onClick msg, checked b ] []
        , text value
        ]


getLegendName : Identifier -> LinkParameters.Model -> String
getLegendName id parameters =
    let
        name =
            getPropertyNameFromId id parameters
    in
        case name of
            Nothing ->
                ""

            Just legend ->
                legend


roleFieldset : LinkParameters.Model -> NetworkRole -> Html Messages.Msg
roleFieldset parameters networkRole =
    let
        network =
            toString networkRole.network

        fieldsetName =
            "role-network-" ++ network

        radioName =
            "r-n-" ++ network

        legendLabel =
            getLegendName networkRole.network parameters
    in
        fieldset [ id fieldsetName ]
            [ legend [] [ text legendLabel ]
            , radio radioName (Messages.SwitchElemRole networkRole.network Producer) "Producer" (networkRole.role == Producer)
            , radio radioName (Messages.SwitchElemRole networkRole.network Consumer) "Consumer" (networkRole.role == Consumer)
            ]


rolesFieldset : Roles -> LinkParameters.Model -> Html Messages.Msg
rolesFieldset roles parameters =
    div [] <|
        List.map (roleFieldset parameters) roles


stateFieldset : ElementState -> Html Messages.Msg
stateFieldset state =
    fieldset [ id "elementState" ]
        [ radio "elemState" (Messages.SwitchElemState RAS) "RAS" (state == RAS)
        , radio "elemState" (Messages.SwitchElemState HS) "HS" (state == HS)
        ]


getFieldsetNode : Identifier -> List Node -> LinkParameters.Model -> Html Messages.Msg
getFieldsetNode id nodes parameters =
    div []
        (case DataModel.getNodeFromId id nodes of
            Nothing ->
                []

            Just node ->
                [ stateFieldset node.state
                , rolesFieldset node.roles parameters
                ]
        )


getFieldsetEdge : Identifier -> List Edge -> Html Messages.Msg
getFieldsetEdge id edges =
    div []
        (case DataModel.getEdgeFromId id edges of
            Nothing ->
                []

            Just edge ->
                [ stateFieldset edge.state ]
        )


makeElementAttributesView : Model -> Html Messages.Msg
makeElementAttributesView model =
    div []
        (case model.selection of
            firstElementId :: elementIdList ->
                [ getFieldsetNode firstElementId model.dataModel.nodes model.dataModel.parameters
                , getFieldsetEdge firstElementId model.dataModel.edges
                ]

            [] ->
                []
        )


view : Model.Model -> Html Messages.Msg
view model =
    div [ class "div-element-type" ]
        [ makeElementAttributesView model ]
