import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { GoogleMaps,
         GoogleMap,
         GoogleMapsEvent,
         Geocoder } from '@ionic-native/google-maps';

import { cities } from './cities';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  private map: GoogleMap;

  public code: string;
  public city: string;

  constructor(public navCtrl: NavController,
              private sqlite: SQLite,
              private googleMaps: GoogleMaps) {
    // cria o banco de dados
    this.sqlite.create({
      name: 'cities.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {

        const query = 'CREATE TABLE IF NOT EXISTS cidades (id INTEGER PRIMARY KEY, ibge INTEGER (7), nome VARCHAR (100), uf VARCHAR (2))';

        db.executeSql(query, {})
          .then(() => {
            console.log('criou bd');
            // verifica se ha dados na tabela
            db.executeSql('SELECT count(*) AS linhas FROM cidades', [])
              .then( rs => {
                console.log('numero de linhas encontradas: ' + rs.rows.item(0).linhas);
                // se naoo houver dados, adiciona lista de cidades
                if (rs.rows.item(0).linhas == 0) {
                  // cria array para popular a tabela
                  let batchCities = [];
                  for (let city of cities) {
                    batchCities.push( [city, []] );
                  }
                  db.sqlBatch(batchCities)
                    .then(() => console.log('tabela populada'))
                    .catch(e => console.log(e));
                }
              } )
              .catch(e => console.log(e));
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));


  }

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {

    // inicializa o mapa
    this.map = this.googleMaps.create('map_canvas');

    // quando o mapa estiver pronto
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        console.log('Map is ready!');

        // pega o local do usuario
        this.map.getMyLocation()
          .then( resp => {

            console.log('minha localização:', resp);

            // seta no mapa
            this.map.setCameraTarget(resp.latLng);
            this.map.setCameraZoom(18);
            this.map.setCameraTilt(30);
            this.map.setMyLocationEnabled(true);

            // adiciona um marcador
            this.map.addMarker({
              title: 'Ionic',
              icon: 'red',
              animation: 'DROP',
              position: {
                lat: resp.latLng.lat,
                lng: resp.latLng.lng
              }
            });

            Geocoder.geocode({position:resp.latLng})
              .then(result => {
                console.log(result);

                if ( result  ) {

                  this.city = result[0].locale;

                  // busca pelo codigo
                  this.sqlite.create({
                    name: 'cities.db',
                    location: 'default'
                  })
                  .then((db: SQLiteObject) => {

                    db.executeSql('SELECT ibge FROM cidades WHERE nome = (?)', [this.city])
                    .then(resData => {
                      // seta o codigo do ibge
                      this.code = resData.rows.item(0).ibge;
                    })
                    .catch(e => console.log(e));
                  })
                  .catch(e => console.log(e));
                }
            })
            .catch(error => console.log(error));

          } );

      });
  }

}
