module ElementAttributesView exposing (..)

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
        name = getPropertyNameFromId id parameters
    in
        case name of 
            Nothing ->
                ""
            Just legend ->
                legend


roleFieldset : LinkParameters.Model -> NetworkRole -> Html Messages.Msg
roleFieldset parameters networkRole =
    let
        network = toString networkRole.network
        fieldsetName = "role-network-"++network
        radioName ="r-n-"++network
        legendLabel = getLegendName networkRole.network parameters
    in 
    fieldset [ id fieldsetName ]
        [ legend [] [ text legendLabel ]
        , radio radioName (Messages.SwitchElemRole networkRole.network Producer) "Producer" (networkRole.role == Producer)
        , radio radioName (Messages.SwitchElemRole networkRole.network Consumer) "Consumer" (networkRole.role == Consumer)
        ]
        

rolesFieldset : Roles -> LinkParameters.Model -> Html Messages.Msg
rolesFieldset roles parameters =
    div []
        <| List.map (roleFieldset parameters) roles 


stateFieldset : ElementState -> Html Messages.Msg
stateFieldset state =
    fieldset [ id "elementState" ]
        [ radio "elemState" (Messages.SwitchElemState RAS) "RAS" (state == RAS)
        , radio "elemState" (Messages.SwitchElemState HS) "HS" (state == HS)
        ]


getFieldsetNode : Maybe Node -> LinkParameters.Model -> Html Messages.Msg
getFieldsetNode node parameters =
    case node of
        Nothing ->
            div [] []

        Just x ->
            div []
                [ stateFieldset x.state
                , rolesFieldset x.roles parameters
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
            [ getFieldsetNode m_node model.dataModel.parameters
            , getFieldsetEdge m_edge
            ]


view : Model.Model -> Html Messages.Msg
view model =
    div [ class "div-element-type" ]
        [ expose model ]



--     [ fieldset [ id "role" ]
--         [ radio "elemType" (Messages.SwitchElemRole networkId Producer) "Producer" False
--         , radio "elemType" (Messages.SwitchElemRole networkId Consumer) "Consumer" False
--         ]
--     , fieldset [ id "elementState" ]
--         [ radio "elemState" (Messages.SwitchElemState RAS) "RAS" True
--         , radio "elemState" (Messages.SwitchElemState HS) "HS" False
--         ]
--     ]
