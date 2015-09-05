'use strict';
'atomic component';
import ROT from 'rot-js';
import MapData from 'MapData';
import BaseLevelGenerator from './BaseLevelGenerator';

export default class ROTIceyMaze extends BaseLevelGenerator {

    inspectorFields = {
        debug: false,
        width: 80, // copied from BaseLevelGenerator
        height: 25, // copied from BaseLevelGenerator
        regularity: 0
    };

    /** @override */
    buildMapData() {

        this.mapData = new MapData(this.width, this.height);
        if (this.debug) {
            console.log(`Generating Terrain: ROT Icey Maze (${this.width} x ${this.height})`);
            console.log('Options:');
            console.log('Regularity: ' + this.regularity);
        }

        let builder = new ROT.Map.IceyMaze(this.width, this.height, this);
        builder.create((x, y, value) => {
            if (value) {
                return;
            } /* do not store walls */
            this.mapData.setTile(x, y, MapData.buildTile(MapData.TILE_FLOOR));
        });

        // See if there are any rooms
        //if (builder.getRooms) {
        //let rooms = builder.getRooms();
        //for (let i = 0, iLen = rooms.length; i < iLen; i++) {
        //rooms[i].getDoors((x, y) => {
        ////map[x][y] = 'tile_floor_c';
        //});
        //}
        //}
        this.processEdges();
    }
}
