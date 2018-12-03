module LayoutMenu
    exposing
        ( Model
        , defaultModel
          -- , OpenDropDown(..)
        )

-- type OpenDropDown
--     = AllClosed
--     | LayoutDropDown


type alias Model =
    { layout :
        Maybe String
        -- , openDropDown : OpenDropDown
    }


defaultModel : Model
defaultModel =
    { layout =
        Just "dagre"
        -- , openDropDown = AllClosed
    }
