import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Geolocation } from '@ionic-native/geolocation';

import { cities } from './cities';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  constructor(public navCtrl: NavController,
              private sqlite: SQLite,
              private geolocation: Geolocation) {
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

    // pega a posicao
    this.geolocation.getCurrentPosition()
      .then((resp) => {
        console.log('posicao atual: ',resp.coords.latitude ,resp.coords.longitude)
      }).catch((error) => {
        console.log('Error getting location', error);
      });

  }

  ngOnInit() {

  }

}
