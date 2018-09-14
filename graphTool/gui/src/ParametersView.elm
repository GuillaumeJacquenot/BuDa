module ParametersView exposing (view)

import Html exposing (Html, Attribute, button, div, fieldset, input, label, span, text, section)
import Html.Attributes exposing (id, name, style, type_, checked, value, placeholder, class)
import Html.Events exposing (onClick, onCheck, on, onInput)
import Model exposing (Model)
import Messages
import DataModel
import Link exposing (Edge)
import Set


checkbox : Bool -> msg -> String -> Html msg
checkbox b msg name =
    div
        [ id "checkbox"
        , style
            [ ( "padding", "10px" )
            , ( "text-align", "left" )
            ]
        ]
        [ label []
            [ input
                [ type_ "checkbox"
                , onClick msg
                , checked b
                ]
                []
            , text name
            ]
        ]


fluxLine_ : Edge -> ( String, Bool ) -> Html Messages.Msg
fluxLine_ x ( key, b ) =
    -- selection globale des parametres pour un lien
    div []
        [ checkbox b
            (Messages.CheckProperty x key)
            key
        ]


highLightLine_ : ( String, Bool ) -> Html Messages.Msg
highLightLine_ ( key, b ) =
    -- selection globale des parametres
    div []
        [ checkbox b
            (Messages.SelectedParameters key)
            key
        ]


exposeList_ : Maybe Edge -> List ( String, Bool ) -> Html Messages.Msg
exposeList_ m_edge list =
    case m_edge of
        Nothing ->
            case list of
                [] ->
                    div [] []

                x :: xs ->
                    div []
                        [ highLightLine_ x
                        , exposeList_ m_edge xs
                        ]

        Just edge ->
            case list of
                [] ->
                    div [] []

                x :: xs ->
                    div []
                        [ fluxLine_ edge x
                        , exposeList_ m_edge xs
                        ]


makeKeyValueList : Maybe Edge -> Model -> List ( String, Bool )
makeKeyValueList m_edge model =
    case m_edge of
        Nothing ->
            List.map
                (\x ->
                    ( x.name
                    , Set.member x.id model.dataModel.selectedParameters
                    )
                )
                model.dataModel.parameters

        Just edge ->
            List.map (\x -> ( x.name, Link.isActive x.id edge )) model.dataModel.parameters


expose : Model -> Html Messages.Msg
expose model =
    let
        m_id =
            case model.selection of
                x :: xs ->
                    Just x

                [] ->
                    Nothing

        m_edge =
            case m_id of
                Nothing ->
                    Nothing

                Just x ->
                    DataModel.getEdgeFromId x model.dataModel.edges
    in
        exposeList_ m_edge (makeKeyValueList m_edge model)


viewDetail_ : Model -> Html Messages.Msg
viewDetail_ model =
    case model.showParameters of
        False ->
            div [] []

        True ->
            div []
                [ Html.hr [] []
                , div [ id "paramView" ] [ expose model ]
                , button [ onClick Messages.CreateParameter, id "createParameter", value "createParameter" ] [ text "+" ]
                , button [ onClick Messages.DeleteParameter, id "deleteParameter", value "deleteParameter" ] [ text "-" ]
                ]


view : Model -> Html Messages.Msg
view model =
    div [ id "parameters", class "vItem", style [ ( "text-align", "center" ) ] ]
        [ button
            [ class "btn btn-primary"
            , id "btnParameters"
            , onClick Messages.ShowHideParameters
            ]
            [ text "Link Parameters" ]
          --text "Geometries"
        , viewDetail_ model
        ]


dialogButton : String -> Html Messages.Msg
dialogButton caption =
    button
        [ class "mdl-button mdl-button--raised mdl-button--accent" ]
        [ text caption ]
