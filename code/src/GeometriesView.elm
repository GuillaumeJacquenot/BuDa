module GeometriesView exposing (view)

import Html exposing (Html, Attribute, button, div, fieldset, input, label, span, text, section)
import Html.Attributes exposing (id, name, style, type_, checked, value, placeholder, class)
import Html.Events exposing (onClick, onCheck, on, onInput)


-- import Geometries

import Messages
import Model exposing (Model)
import DataModel
import Node exposing (Node)


viewDetail_ : Model -> Html Messages.Msg
viewDetail_ model =
    case model.showGeometries of
        False ->
            div [] []

        True ->
            div []
                [ Html.hr [] []
                , div [ id "geometryView" ] [ expose model ]
                , button [ onClick Messages.CreateGeometry, id "createGeometry", value "createGeometry" ] [ text "+" ]
                , button [ onClick Messages.DeleteGeometry, id "deleteGeometry", value "deleteGeometry" ] [ text "-" ]
                ]


view : Model -> Html Messages.Msg
view model =
    div [ id "geometries", class "vItem", style [ ( "text-align", "center" ) ] ]
        [ button
            [ class "btn btn-primary"
            , id "btnGeometries"
            , onClick Messages.ShowHideGeometries
            ]
            [ text "Geometries" ]
          --text "Geometries"
        , viewDetail_ model
        ]


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
    in
        exposeList_ m_node (makeKeyValueList m_node model)


makeKeyValueList : Maybe Node -> Model -> List ( String, Bool )
makeKeyValueList m_node model =
    case m_node of
        Nothing ->
            List.map
                (\x ->
                    ( x.name
                    , case model.geometryId of
                        Nothing ->
                            False

                        Just id ->
                            (x.id == id)
                    )
                )
                model.dataModel.geometries

        Just node ->
            List.map (\x -> ( x.name, Node.hasGeometry x.id node )) model.dataModel.geometries


exposeList_ : Maybe Node -> List ( String, Bool ) -> Html Messages.Msg
exposeList_ m_node list =
    case m_node of
        Nothing ->
            -- div [] []
            case list of
                [] ->
                    div [] []

                x :: xs ->
                    div []
                        [ highLightLine_ x
                        , exposeList_ m_node xs
                        ]

        Just n ->
            case list of
                [] ->
                    div [] []

                x :: xs ->
                    div []
                        [ fluxLine_ n x
                        , exposeList_ m_node xs
                        ]


fluxLine_ : Node -> ( String, Bool ) -> Html Messages.Msg
fluxLine_ n ( key, b ) =
    div []
        [ checkbox b
            (Messages.CheckNodeGeometryProperty n key)
            -- Messages.NoOp
            key
          -- , svgBox Messages.NoOp key
        ]


highLightLine_ : ( String, Bool ) -> Html Messages.Msg
highLightLine_ ( key, b ) =
    div []
        [ (chb ( key, b ) (Messages.HighLightGeometry key) (Messages.LoadGeometryButton key) key) ]


chb : ( String, Bool ) -> msg -> msg -> String -> Html msg
chb ( key, b ) msg1 msg2 name =
    div
        [ style
            [ ( "padding", "10px" )
            , ( "text-align", "left" )
            ]
        ]
        [ input
            [ type_ "checkbox"
            , onClick msg1
            , checked b
            , style [ ( "padding", "10px 0" ) ]
            ]
            []
        , label [ style [ ( "padding-right", "10px" ) ] ] [ text name ]
        , button
            [ onClick msg2
            , id "loadGeometryButton"
            ]
            [ text "svg" ]
        ]


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



-- svgBox : msg -> String -> Html Messages.Msg
-- svgBox msg s =
--     div [ id "svg" ] [ text s ]
