
# BuDa user manual

## Description

BuDa is a tool dedicated to system architecture. Its name is the contraction of Bubble Diagram, after the ellipsoïdal shape of the block objects in the first release of the tool.
The GUI is organized as follows :
-	System models are displayed graphically on a wide central panel (the workspace for graphic manipulation and display of the model)
-	Two rows consisting of one text box and a series of buttons are located at the upper left of the screen, above the workspace :  
 -	The uppermost row is used for loading, saving, printing,… models and reports about models. File names are filled in the text box that we may call the “filename box”.
 -	The lower row is used to edit objects within the model displayed in the workspace (create, rename, group, etc). The text box is used to specify object names and is called accordingly the “objectname box”.
-	A series of click buttons is available above the workspace, beside the two rows we just described. These click buttons are used to choose between one view of the model or another. 
-	On the right of the workspace the user will find a column with advanced model properties that he/she is free to set :
	One text box to set specific (text) attributes to model objects
 - 	the list of “parameters” that links might support, for instance fuel, water, aire or electrical power
 - 	the list of “functional chains” that objects might be involved in, for instance “minimal functions for start-up” or “cruise mode operation”
 - 	the list of geometric views, set by the user, against which the components within the model might be projected.
The following sections provide more details on how to use the tool.

## Manipulating system architecture diagrams
###	General object structure – blocks, links, hierarchy
BuDa enables the users to map any physical system with the help of two object types:
-	Blocks: components of the ship are represented by rectangular shapes called blocks. Blocks are organized in a hierarchical structure in which each block is the “parent” of other blocks, in the sense that children are included in the material package designated by the parent block. 
-	Links: physical interfaces between blocks are represented by straight lines between blocks. These interfaces may be cabling, piping, engine shafts, etc. Structural links (welding, bolts, etc.) are not displayed to avoid overloading the system diagram, and because they have little interest with respect to functional aspects of the system.
The blocks are structured following the hierarchical PBS structure of the ship: there are higher-level blocks (parents) and lower-level ones, just like there are higher and lower levels in the PBS. In this view, the structure of BuDa models is self similar: the same type of objects (blocks & links) are found at different levels of detail.
Links cannot be matched with a hierarchical structure as easily as blocks can. Some rules have been implemented in the architecture diagram tool in order to handle links acrosse the PBS levels. Essentially, each time a link is created between two blocks, additional links are created to connect the parents of the blocks. The logic behind these rules shall be understood as in the following example : 
-	The control board inside a system (e.g., HVAC) is connected (wired) with the connector on a command & control panel. 
-	As a consequence, the HVAC itself is connected with the command & control panel, just as their subparts are. In this case the tool generates a hard link between the HVAC and the control & command panel. This “higher-level” link, that the user created implicitely rather than explicitely, is later used to ease the navigation through the architecture diagram and the display of system features at various design levels.
These operations are described in detail below.


###	General operations on models
####	Undo / Redo
Press “Undo”. The last change in the model (block or link creation, update, move, etc.) is cancelled.
“Undo” can be repeated to cancel one or more operations performed since the beginning of the session.
To recall an operation that has just been “undone”, press “Redo”. One or more successive “Undo” can be “redone”, until all successive “Undo”s have been cancelled.
 
###	Basic operations on blocks
####	Select
Click on a block displayed in the workspace. The edge of the block is displayed in color, meaning that the block has been selected.
Multiple selection is possible by keeping shift or ctrl key pressed while clicking on several blocks.
####	Create
Fill in the name of the block in the “objectname” text box, then click on the “Block” button.
####	Rename
Select block.
Fill in the new name of the block in the “objectname” text box, then click on the “Name” button.
####	Delete 
Select block.
Press ctrl+shift+suppr; block is removed from model with all its children blocks and inner / outer links.
####	Group 
Select all the blocks that shall be grouped.
In the “objectname” text box, fill in the name of the father block to be created “above” the selected blocks. 
Press “Group”. A new block is created at the level occupied initially by the selected blocks in the PBS. This block bears the name filled in the “objectname” box. The selected blocks have been moved one level down in te PBS hierarchy, and the new block is their father.
This function is used to introduce an intermediate level in the PBS, when the number of blocks at a given level gets too large.
####	Set / update attribute
Select block.
Fill in / modify text box “attribute” on the right of the workspace.
####	Copy
Select block.
Press ctrl+c. The block, its children, its inner and outer links have all been saved in a temporary buffer for further use.
####	Cut
Select block.
Press ctrl+x. The block, its children, its inner and outer links have all been :
-	saved in a temporary buffer for further use
-	deleted from the model. 
####	Paste
Press ctrl+v. If a block has been copied / cut any time before, during the session, then the block, its children, its inner and outer links are all pasted in the model, at the highest lever in the PBS (the pasted block is the father of a new hierarchy of blocks).
Optional : You might select a block before pasting. When pasted, the previously copied/cut block has the selected block as a father. 
####	Find / Search
Fill in the name of the block you are searching in the “objectname” text box.
Press F1. The block with the name in the text box is selected – in the “bubble” view, the view is centered around this block.
Note: when several blocks bear the same name, the function finds only one block. 

###	Basic operations on links
####	Select
Click on a link displayed in the workspace. The link is displayed in a thick colored line, meaning that the link has been selected.
####	Create
Select two blocks.
Press “Link” ; a line is displayed between both blocks, meaning that link between both blocks and between all father blocks have been created.
####	Delete 
Select link.
Press ctrl+shift+suppr; the selected link and all the links that had been generated from this link are removed from the model.

####	Set / update attribute
Select link.
Fill in / modify text box “attribute” on the right of the workspace.
###	Advanced block features – functional chains
Blocks can be assigned to functional chains, to allow the mapping of all the blocks that contribute to specific functions or operational modes.
To manipulate functional chains, press the blue rectangle reading “functional chain” on the right of the workspace. The “functional chain” area unfolds.
####	Creating a functional chain
Fill in the new name of the functional chain in the “objectname” text box, then click on the “+” button at the bottom of the “functional chain” area.
A new field with the name of the functional chain has been created in the “functional chain” area, with a tick box on the left. 
####	Deleting a functional chain
Fill in the new name of the functional chain in the “objectname” text box, then click on the “-” button at the bottom of the “functional chain” area.
The field with the name of the functional chain has disappeared. All the blocks to which the functional chain had been assigned have been updated (the functional chain is not assigned to them anymore). 
####	Assigning a functional chain to a block
Select a block by clicking on it.
All the functional chains whose names appear to have been selected in the “functional chain” area (white box ticked) have already been assigned to the block.
To assign an additional functional chain to the block, click the white box on the left of the name of the functional chain.
To cancel, click on the box once again.
Note 1: when a functional chain is assigned to a block, it is automatically assigned to all the parents of the block. When the assignment to a block is cancelled, it is automatically cancelled from all the parents of the block unless the functional chain is still assigned to a sibling of the block (in which case the parents inherit the assignment from the sibling of the block, if not from the block itself).
Note 2 : the assignment of a functional chain to a block can be cancelled only if no child of the block has been assigned the functional chain.

####	Highlighting functional chains
Unselect all blocks by clicking on the backgroung of the workspace.
To highlight one or more functional chains, select them from the “functional chain” area by clicking on the boxes on the left of their names. All the blocks that the selected functional chains have been assigned to are displayed as pink circles; all the links that join two blocks that have been assigned the same (highlighted) functional chain are displayed in thick pink lines ; links that join one block that has been assigned the functional chain and one block that has not are displayed in thick, dashed black lines to highlight the frontier of the functional chain.
To cancel highlight, unselect functional chains by clicking on ticked boxes. Note : you should make sure no block has been selected before, otherwise you will assign the functional chain to the selected block instead of cancelling the highlight.
###	Advanced block features – Hide / show
Select block by clicking on it.
Press “insert” ; the block has been hidden from the “bubble” view (it does not show anymore). 
Press “insert” again ; the block is displayed on the “bubble” view. 
Note: this feature is useful to handle alternatives within a single model. All the blocks show on the “flat” and “PBS” views, allowing the user to set them “hidden” or not.
###	Advanced block features – blow / collapse
In the Bubble view it is possible to get a more detailed view of the inner structure of a block.
To do so, select a block by left-clicking on it once.
Then press F2 (for “Blow”) – this is the windows command, under linux it is replaced by F2. The children blocks inside the selected block are displayed, with their inner and outer links.
Repeating the procedure with a previously “blown-up” block cancels the operation and results in a “collapse” of the block returning to its original state.  
Note that the “blowing” operation can be repeated recursively on inner blocks of the already blown-up block. This is useful to specify links between lower-level blocks. 19 feb 2018: this recursion works up to 2 levels down – work is in progress to implmeent recursion down to the lowest level.

###	Advanced block features – Geometry
Blocks can be assigned to (2D) geometric views of the system. This function is useful to visualize the approximate location of the components within the actual system (this is done by applying the “Geometry” layout – see below).
To manipulate geometric views, press the blue rectangle reading “Geometry” on the right of the workspace. The “Geometry” area unfolds.
####	Creating a geometric view
Fill in the new name of the geometric view in the “objectname” text box, then click on the “+” button at the bottom of the “geometric view” area.
A new field with the name of the geometric view has been created in the “Geometry” area, with a tick box on the left. 
A svg file can be selected to serve as a background picture for the “Geometry” view, by clicking on the “svg” button located on the right of the name of the view.
####	Deleting a geometric view
Fill in the new name of the geometric view in the “objectname” text box, then click on the “-” button at the bottom of the “Geometry” area.
The field with the name of the geometric view has disappeared. All the blocks to which the geometric view had been assigned have been updated (the geometric view is not assigned to them anymore). 
####	Assigning a geometric view to a block
Select a block by clicking on it.
All the geometric views whose names appear to have been selected in the “geometry” area (white box ticked) have already been assigned to the block.
To assign an additional geometric view to the block, click the white box on the left of the name of the geometric view.
To cancel, click on the box once again.
Note: a geometric view can be assigned to an individual block without being assigned to either its parents or its children.

###	Advanced link features – link parameters
Links can be assigned parameters. This feature is useful to assign and display networks and circuits of any given kind.
To manipulate link parameters, press the blue rectangle reading “link parameter” on the right of the workspace. The “link parameter” area unfolds.
####	Creating a link parameter
Fill in the new name of the link parameter in the “objectname” text box, then click on the “+” button at the bottom of the “link parameter” area.
A new field with the name of the link parameter has been created in the “link parameter” area, with a tick box on the left. 
####	Deleting a link parameter
Fill in the new name of the link parameter in the “objectname” text box, then click on the “-” button at the bottom of the “link parameter” area.
The field with the name of the link parameter has disappeared. All the links to which the link parameter had been assigned have been updated (the link parameter is not assigned to them anymore). 
#### Assigning a link parameter to a link
Select a link by clicking on it.
All the link parameters whose names appear to have been selected in the “link parameter” area (white box ticked) have already been assigned to the link.
To assign an additional link parameter to the link, click the white box on the left of the name of the link parameter.
To cancel, click on the box once again.
Note 1: when a link parameter is assigned to a link, it is automatically assigned to all the parents of the link. When the assignment to a link is cancelled, it is automatically cancelled from all the children of the link ; it is also cancelled from all the parents of the link unless the link parameter is still assigned to a sibling of the link (in which case the parents inherit the assignment from the sibling of the link, if not from the link itself).
Note 2 : the assignment of a link parameter to a link can be cancelled only if no child of the link has been assigned the link parameter.

####	Highlighting link parameters
Unselect all links by clicking on the backgroung of the workspace.
To highlight one or more link parameters, select them from the “link parameter” area by clicking on the boxes on the left of their names. All the links that the selected link parameters have been assigned to are displayed in thick lines; all the blocks that are connected with these links are displayed in pink circles.
To cancel highlight, unselect link parameters by clicking on ticked boxes. Note : you should make sure no link has been selected before, otherwise you will assign the link parameter to the selected link instead of cancelling the highlight.


### Advanced link features – tightness
“Tightness” is used to express that a functional chain is segregated from the rest of the system.
Highlight functional chain F (see section 5.2.5.4). Links at the “frontier” of F are displayed in thick, dashed grey lines. 
Type name of functional chain in “objectname” text box. Select dashed link L, press “Tight”. Link L has been declared “tight” to anything coming from outside functional chain F (data, energy, etc). If functional chain highlight is refreshed, link L is displayed as a light blue, thick dashed line.
Note: “tightness” is declared with reference to a specific functional chain. Link L might be “tight” for functional chain F1, and “untight” for functional chain F2.
##	Displaying architecture diagrams 
###	Multi-level model representation
Architecture models can be extremely complex, with thousands of blocks and thousands of links. Several views are proposed in the architecture tool, in order to ease architecture understanding through ad hoc visualization.
Block or link creation, update, delete, copy/paste, etc. are available in all views. 
Buttons on the right of the upper bar give access to the various visualization types.
###	PBS
Select the “PBS” button; the hierarchy of blocks is displayed with the following convention :
-	Blocks are represented by square boxes with their names above,
-	Hierarchical dependency is displayed with lines between blocks; one line between block B1 (above) and block B1.1 (below) means that B1.1 is the “child” of B1; components in B1.1 are all included in B1 as well.
###	Flat view
Select the “Flat” button; all the blocks in the model are displayed, with:
-	Blocks of the lowest level (that have no “children”) are represented by square boxes,
-	“parent” blocks show as rectangular boxes containing their “children” blocks.
Lines between blocks represent physical links. In this view, only the links of lowest level are displayed – and all of them are displayed.
###	Bubble view
Select the “Bubble” button; the block currently selected (let us call it B) shows as a “bubble” (large rectangle) in the middle of the workspace. The only other blocks to be displayed are:
-	Children of B
-	Blocks that are linked with B or children of B. 
Lines between blocks represent physical links. In this view, only the links inside B or originating from B are displayed.
The “Bubble” offers a synthetic view of one block (“B”), its inner structure (children and links between them), its outer environment (blocks outside of “B” and links with “B”).
It is possible to navigate through the PBS levels within the “Bubble” view :
-	Press “up” (keyboard arrow “up”); the Bubble view is now centered on the father of “B”, rather than “B”. 
-	Double click (left click) on a child or neighbor of “B”; the Bubble view is now centered on the block that has been double-clicked on. 
###	Geometry view
Select the “Geometry” button; all the blocks that have been assigned to a “Geometry” are displayed.
Select a specific “Geometry” view (let us call it “G”) by clicking on the tick box left of the view’s name. Then:
-	all the blocks that have been assigned to “G” are displayed, and the links between them.
-	If an svg has been assigned to view “G”, it is displayed in background.
The location of the blocks can be changed by the user, to reflect the spatial organization of the blocks inside the system represented by the svg.
###	Complement : “All” view
This view shows all the blocks and all the links between them (implicitely or explicitely created by the user). This view becomes quickly untractable with the number of items; it is used mostly for software development purposes. 

##	Saving and opening models

###	General - Formats 
Architecture models are saved in json format. It is possible to generate an architecture model from csv files with specific structure.
Operations on model files (save, import, export, etc) are performed by using the uppermost buttons in the feature bar at the top of the application. File names are filled in the uppermost text box in the upper left corner of the browser’s window. This textbox is called the “filename” box in the following.
###	Saving a model
Fill in the name of the file in the “filename” text box.
Press “Save”; the architecture model has been saved in the “upload” folder of your browser. 
###	Opening a model
Press “Open”; a window pops up, allowing you to browse for the json file to be downloaded. 

###	Importing a model - csv
It is possible to import a model from a csv table.
To import a csv file, press “Open”; a window pops up, allowing you to browse for the csv file to be downloaded. 
Once you have selected the csv file to be downloaded, a new model is generated from the data held by the csv file. The generated model has the same structure as any other architecture model; it can be saved in the standard json format.
The csv shall have the following structure :

|ID	             |Label 	                         |Link source 1 ID (option)	|Link source 2 ID (option)	|Link parameter (option)
|------------- |----------------------------|---------------------------------|----------------------------------|------
|DR2354	|Component xxx	         |HJ6787	                           |UJ0989	                                |fuel

 Where :
-	ID is a 6+ character string where :
 - the first character is the name of the father of …
 -	a block which name consists in the first two characters of ID. This block is the father of…
 -	a block called “ID”, that has…
 -	“Label” as an attribute.
-	If the optional fields “Link source 1 ID” and “Link source 2 ID” are both filled in with the names of existing blocks, then no new block is created ; rather, a link between the source blocks is created, with (optional) link parameter “Link parameter”. 
Note: when the number of components and / or links is large (>1000), model generation might take a while (several minutes) or even fail in extreme cases.
###	Importing a component
“Components” are standard architecture models.
Press “Import”; a window pops up, allowing you to browse for the “component” json file to be downloaded.
Once you have downloaded the json file, the “component” is saved in a temporary buffer. Pressing “ctrl+V” will paste the component inside the currently selected block.
##	Exports 
###	General - Formats 
Exports can be generated for further use outside the architecture modeling tool.
Operations on model files (save, import, export, etc) are performed by using the uppermost buttons in the feature bar at the top of the application. File names are filled in the uppermost text box in the upper left corner of the browser’s window. This textbox is called the “filename” box in the following.
###	Exporting data – csv, txt
Fill in the name of the export file in the “filename” text box.
Press “Export”; two export files have been generated:
-	“filename.txt” provides the names of all blocks in the model, structured according to the PBS. Under each block one finds :
 -	the “attribute” of the block
 -	the names of every functional chain the block has been assigned.
-	“filename.csv” provides the list of all the links that have been specified or generated in the model. Each link is described in a specific line of the csv file, with :
 -	Col 1: Source of the link (a block in the PBS)
 -	Col 2: target of the link (a block in the PBS)
 -	Col 3 – n+2: each column is assigned to one of the n link parameters in the model. Default value is 0; if link in line L has been assigned link parameter in column C, cell at location (C;L) has value 1.
 -	Col n+3: attributes of links. 

###	Screenshots
Fill in the name of the export file in the “filename” text box.
Press “Export”; two export files have been generated:
-	“filename.svg” is a screenshot of the workspace in vectorial format
-	“filename.png” is a screenshot of the workspace in bitmap format.


##	Assessing architectures 
empty

##	Using component libraries
empty 


##	Setting component locations
empty










