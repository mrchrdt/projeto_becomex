<template>
  <div>
      <b-card>
        <template v-slot:header>
          <h4 class="mb-0">Becomex</h4>
              Países encontrados: {{ qtCountries }}
        </template>
        <b-card header="Rotas">
          <b-row>
            <b-col>
              <b-form-group label="Origem" label-for="origem">
                <b-form-select id="origem" v-model="form.origem" :options="this.countries"
                  value-field="alpha3Code"
                  text-field="name"
                ></b-form-select>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Destino" label-for="destino">
                <b-form-select id="destino" v-model="form.destino" :options="this.countries"
                  value-field="alpha3Code"
                  text-field="name"
                ></b-form-select>
              </b-form-group>
            </b-col>
            <b-col sm="2">
              <b-form-group style="padding-top:2em;">
                <b-button @click="tracarRota">Trace a rota</b-button>
              </b-form-group>
            </b-col>
          </b-row>
          <b-card>
            {{ rota }}
          </b-card>
        </b-card>
        <br />
        <b-card header="Pesquisar países">
          <b-row>
              <b-col sm="3">
                  <b-form-group label="Nome" label-for="nome">
                  <b-form-input id="nome" v-model="form.nome" @input="form.nome=$event.toUpperCase()"></b-form-input>
                  </b-form-group>
              </b-col>
              <b-col sm="3">
                  <b-form-group label="Sigla" label-for="sigla">
                  <b-input id="sigla" v-model="form.sigla" :maxlength="2" @input="form.sigla=$event.toUpperCase()"></b-input>
                  </b-form-group>
              </b-col>
              <b-col sm="3">
                  <b-form-group label="Moeda" label-for="moeda">
                      <b-form-input id="moeda" v-model="form.moeda" @input="form.moeda=$event.toUpperCase()"></b-form-input>
                  </b-form-group>
              </b-col>
              <b-col sm="1">
                  <b-form-group style="padding-top:2em;">
                      <b-button @click="pesquisar(form)">Pesquisar</b-button>
                  </b-form-group>
              </b-col>
          </b-row>
          <b-table striped hover :items="items" :fields="fields">
          <template v-slot:cell(flag)="row">
            <div class="text-center">
              <img :src="row.item.flag" height="20">
            </div>
          </template>

          <template v-slot:cell(actions)="row">
            <b-button size="sm" @click="row.toggleDetails">
              {{ row.detailsShowing ? 'Ocultar' : 'Mostrar' }} detalhes
            </b-button>
          </template>

          <template v-slot:row-details="row">
            <b-card>
              <ul>
                <li>População: {{ row.item.population.toLocaleString() }}</li>
                <li>Timezone: {{ row.item.timezones.filter((value, index, self) => value !== null && self.indexOf(value) === index).join(', ') }}</li>
                <li>Moedas: {{ row.item.currencies.map(x => x.symbol).filter((value, index, self) => value !== null && self.indexOf(value) === index).join(', ') }}</li>
                <li>Línguas: {{ row.item.languages.map(x => x.name).filter((value, index, self) => value !== null && self.indexOf(value) === index).join(', ') }}</li>
                <li>Capital: {{ row.item.capital }}</li>
                <li>Blocos econômicos: {{ row.item.regionalBlocs.map(x => x.name).filter((value, index, self) => value !== null && self.indexOf(value) === index).join(', ') }}</li>
                <li>Países que fazem fronteira: {{ row.item.borders.filter((value, index, self) => value !== null && self.indexOf(value) === index).join(', ') }}</li>
              </ul>
            </b-card>
          </template>
          </b-table>
        </b-card>

      </b-card>
  </div>
</template>

<script>
import _api from '../_api'

export default {
  data () {
    return {
      rota: [],
      form: {},
      countries: [],
      items: [],
      details: {},
      fields: [
        {
          key: 'name',
          label: 'Nome do país'
        },
        {
          key: 'alpha2Code',
          label: 'Sigla'
        },
        {
          key: 'currencies',
          label: 'Moedas',
          formatter: value => value.map(x => x.symbol).filter((value, index, self) => value !== null && self.indexOf(value) === index).join(', ')
        },
        {
          key: 'flag',
          label: 'Bandeira'
        },
        {
          key: 'regionalBlocs',
          label: 'Blocos econômicos',
          formatter: value => value.map(x => x.acronym).join(', ')
        },
        {
          key: 'actions',
          label: ''
        }
      ]
    }
  },
  created () {
    _api.GetCountries.Get((response) => {
      this.countries = response
      this.items = response
    })
  },
  computed: {
    qtCountries () {
      return this.items.length
    }
  },
  methods: {
    tracarRota () {
      this.rota = []
      let path = []
      let origem = this.form.origem
      let destino = this.form.destino
      let pathPesquisar = this.countries.filter(x => x.region === this.countries.find(el => el.alpha3Code === origem).region)

      let _borders = []
      let ultimo = []
      while (!path.some(s => s.find(f => f === destino))) {
        if (ultimo.length === 0) ultimo.push([origem])

        let _ultimo = []
        ultimo.forEach(ul => {
          let _path = pathPesquisar.find(p => p.alpha3Code === ul.slice(-1)[0])

          if (_path && _path.borders) {
            _path.borders.forEach(b => {
              if (!_borders.find(it => it === b)) {
                path.push(ul.concat(b))
                _ultimo.push(ul.concat(b))
              }
            })
            _borders.push(ul.slice(-1)[0])
          }
        })

        if (_ultimo.length > 0) {
          ultimo = _ultimo
        } else {
          path = []
          break
        }
      }
      path.find(el => el.slice(-1)[0] === destino).forEach(el => this.rota.push(pathPesquisar.find(x => x.alpha3Code === el).name))
    },
    pesquisar (val) {
      if (!val.nome && !val.sigla && !val.moeda) { alert('É obrigatório informar algum valor.') } else {
        this.items = this.countries.filter(x =>
          ((val.nome) ? x.name.toUpperCase().includes(val.nome) : true) &&
          ((val.sigla) ? x.alpha2Code.includes(val.sigla) : true) &&
          ((val.moeda) ? x.currencies.find(c => c.name !== null && c.name.toUpperCase().includes(val.moeda)) : true)
        )
      }
    }
  }
}
</script>
