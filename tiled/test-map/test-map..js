(function(name,data){
 if(typeof onTileMapLoaded === 'undefined') {
  if(typeof TileMaps === 'undefined') TileMaps = {};
  TileMaps[name] = data;
 } else {
  onTileMapLoaded(name,data);
 }})("test-map",
{ "height":12,
 "layers":[
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 10, 1, 1, 0, 1, 1, 6, 1, 1, 0, 5, 11, 12, 11, 4, 0, 6, 1, 1, 1, 6, 0, 6, 1, 1, 1, 6, 0, 2, 11, 15, 11, 3, 0, 1, 1, 6, 1, 1, 0, 1, 1, 6, 1, 1, 0, 1, 1, 6, 1, 1, 0, 1, 1, 7, 1, 1],
         "height":12,
         "name":"Tile Layer 1",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":6,
         "x":0,
         "y":0
        }],
 "nextobjectid":1,
 "orientation":"isometric",
 "renderorder":"right-down",
 "tileheight":50,
 "tilesets":[
        {
         "columns":0,
         "firstgid":1,
         "margin":0,
         "name":"base",
         "spacing":0,
         "tilecount":15,
         "tileheight":65,
         "tiles":
            {
             "0":
                {
                 "image":"roadTiles_v2\/png\/grass.png"
                },
             "1":
                {
                 "image":"roadTiles_v2\/png\/roadCornerES.png"
                },
             "10":
                {
                 "image":"roadTiles_v2\/png\/roadNorth.png"
                },
             "11":
                {
                 "image":"roadTiles_v2\/png\/roadTEast.png"
                },
             "12":
                {
                 "image":"roadTiles_v2\/png\/roadTNorth.png"
                },
             "13":
                {
                 "image":"roadTiles_v2\/png\/roadTSouth.png"
                },
             "14":
                {
                 "image":"roadTiles_v2\/png\/roadTWest.png"
                },
             "2":
                {
                 "image":"roadTiles_v2\/png\/roadCornerNE.png"
                },
             "3":
                {
                 "image":"roadTiles_v2\/png\/roadCornerNW.png"
                },
             "4":
                {
                 "image":"roadTiles_v2\/png\/roadCornerWS.png"
                },
             "5":
                {
                 "image":"roadTiles_v2\/png\/roadEast.png"
                },
             "6":
                {
                 "image":"roadTiles_v2\/png\/roadEndEast.png"
                },
             "7":
                {
                 "image":"roadTiles_v2\/png\/roadEndNorth.png"
                },
             "8":
                {
                 "image":"roadTiles_v2\/png\/roadEndSouth.png"
                },
             "9":
                {
                 "image":"roadTiles_v2\/png\/roadEndWest.png"
                }
            },
         "tilewidth":100
        }],
 "tilewidth":100,
 "version":1,
 "width":6
});