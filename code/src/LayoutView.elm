module LayoutView exposing (view)

import Html exposing (Html, Attribute, button, div, fieldset, input, label, span, text, section, legend)
import Html.Attributes exposing (id, name, style, type_, checked, value, placeholder, class, accept)
import Html.Events exposing (onClick, on, onInput)
import Model exposing (ViewType(..))
import Messages exposing (Msg(..))


-- import ModelActions
-- menuConfig : Dropdown.Config Messages.Msg
-- menuConfig =
--     { defaultText = "-- pick layout --"
--     , clickedMsg = Messages.Toggle LayoutMenu.LayoutDropDown
--     , itemPickedMsg =
--         (\s ->
--             Messages.LayoutPicked s
--         )
--     }
--
--
-- menuItems : List String
-- menuItems =
--     [ "dagre"
--       -- , "spread"
--     , "circle"
--       -- , "grid"
--     , "cose-bilkent"
--     ]
--
--
-- view : Model.Model -> Html Messages.Msg
-- view model =
--     let
--         menuContext =
--             { selectedItem = model.layoutMenu.layout
--             , isOpen =
--                 model.layoutMenu.openDropDown == LayoutMenu.LayoutDropDown
--             }
--     in
--         div [ id "menu" ] [ Dropdown.view menuConfig menuContext menuItems ]


radio : String -> msg -> String -> Bool -> Html msg
radio s msg value b =
    label
        [ style [ ( "padding", "5px" ) ]
        ]
        [ input [ type_ "radio", name s, onClick msg, checked b ] []
        , text value
        ]


view : Model.Model -> Html Messages.Msg
view model =
    div []
        [ fieldset [ id "layoutset" ]
            [ radio "layoutBtn" (Messages.SwitchToLayout "dagre") "dagre" (model.layoutMenu.layout == Just "dagre")
            , radio "layoutBtn" (Messages.SwitchToLayout "circle") "circle" (model.layoutMenu.layout == Just "circle")
            ]
        ]
