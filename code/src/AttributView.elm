module AttributView exposing (view)

import Html exposing (Html, Attribute, button, div, label, span, text, textarea)
import Html.Attributes exposing (id, name, style, type_, value, placeholder, class)
import Html.Events exposing (onInput)


-- import Html.Events exposing (onClick, onCheck, on, onInput)

import Model exposing (Model)
import Messages
import DataModel


-- import Link exposing (Edge)

import Attribut exposing (Attribut)


textarea_ : Attribut -> Html Messages.Msg
textarea_ attribut =
    textarea
        [ value attribut
        , id "attributArea"
        , onInput (Messages.UpdateAttribute)
        ]
        []


exposeMaybeAttribut_ : Maybe Attribut -> Html Messages.Msg
exposeMaybeAttribut_ m_attribut =
    let
        txt =
            case m_attribut of
                Nothing ->
                    ""

                Just attribut ->
                    attribut
    in
        div [] [ textarea_ txt ]


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

        m_attribut =
            case ( m_edge, m_node ) of
                ( Nothing, Just node ) ->
                    node.attribut

                ( Just edge, Nothing ) ->
                    edge.attribut

                ( _, _ ) ->
                    Nothing
    in
        exposeMaybeAttribut_ m_attribut


view : Model -> Html Messages.Msg
view model =
    div [ id "attribut", class "vItem", style [ ( "text-align", "center" ) ] ]
        [ text "Attribut"
        , Html.hr [] []
        , expose model
        ]
