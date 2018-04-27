import React from 'react';
import { View, Text, FlatList,StyleSheet, ScrollView} from 'react-native';
import { Button, Divider } from 'react-native-elements';
import NavigationBar from 'navigationbar-react-native';
import FlatListSelector from '../components/FlatListSelector';

const data = [
{key:0, time: '7:30 AM'}, {key:1, time: '8:00 AM'}, {key:2, time: '8:30 AM'}, {key:3, time: '9:00 AM'}, {key:4, time: '9:30 AM'},
{key:5, time: '10:00 AM'}, {key:6, time: '10:30 AM'}, {key:7, time: '11:00 AM'}, {key:8, time: '11:30 AM'}, {key:9, time: '12:00 PM'},
{key:10, time: '12:30 PM'}, {key:11, time: '1:00 PM'}, {key:12, time: '1:30 PM'}, {key:13, time: '2:00 PM'}, {key:14, time: '2:30 PM'},
{key:15, time: '3:00 PM'}, {key:16, time: '3:30 PM'}, {key:17, time: '4:00 PM'}, {key:18, time: '4:30 PM'}, {key:19, time: '5:00 PM'},
{key:20, time: '5:30 PM'}, {key:21, time: '6:00 PM'}, {key:22, time: '6:30 PM'}, {key:23, time: '7:00 PM'}, {key:24, time: '7:30 PM'},
{key:25, time: '8:00 PM'}, {key:26, time: '8:30 PM'}, {key:27, time: '9:00 PM'}, {key:28, time: '9:30 PM'}
]
const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

export default class FreeTimeScreen extends React.Component {
  static navigationOptions = {
    title: 'Free Time',
  };

  constructor(props) {
    super(props);
    this.state = {today: new Date()};
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', ()=>{this.onRefresh()});
    console.log(this.getTimeIndex())
  }

  onRefresh = () => {
    currentDay = new Date()
    this.setState({today:currentDay})
  }

  getTimeIndex() {
    d = new Date();
    month = d.getMonth();
    date = d.getDate();
    day = d.getDay();
    hour = d.getHours();
    min = d.getMinutes();
    i = (hour - 7) * 2 + Math.floor(min / 30) - 1;
    return i
  }

  render() {
    console.log('rerendering')
    return (
      <View >

        <ScrollView horizontal={true} bounces={false}>
          <View>
            <View style={{flexDirection:'row', justifyContent:'space-around'}}>
              {this.renderHeader(this.state.today)}
            </View>
            <Divider style={{ backgroundColor: 'black' }} />
            <ScrollView>
              <View style={{flexDirection:'row'}}>
              {this.renderDaysofWeek(this.state.today)}
              </View>
            </ScrollView>
          </View>
        </ScrollView>

      </View>
    );
  }

  renderHeader = (today) => {
    daysOfWeek = []
    dates = []
    if (this.getTimeIndex() >= 28) {
      today = this.addDays(today,1)
      var dayOver = true
    }
    for (i = 0; i < 7; i++) {
      day = this.addDays(today, i)
      console.log(day)
      daysOfWeek.push(days[day.getDay()])
      dates.push(day.toDateString())
    }

    return (
      dates.map((d, i)=> {
        if (dayOver == true) curr = false
        else if (i == 0) curr = true
        else curr = false
        return (
        <View key={i} >
          <Text style={{fontWeight:'bold', fontSize:20, textAlign:'center',}}>
          {`${d.substring(0,4)}\n${d.substring(4,10)}`}
        </Text>
        </View>)
      })
    )
  }

  renderDaysofWeek = (today) => {
      daysOfWeek = []
      dates = []
      if (this.getTimeIndex() >= 28) {
        today = this.addDays(today,1)
        var dayOver = true
      }
      for (i = 0; i < 7; i++) {
        day = this.addDays(today, i)
        console.log(day)
        daysOfWeek.push(days[day.getDay()])
        dates.push(day.toDateString())
      }

      return (
        dates.map((d, i)=> {
          if (dayOver == true) curr = false
          else if (i == 0) curr = true
          else curr = false
          return (
          <View key={i} >
            {/* <Text style={{fontWeight:'bold', fontSize:20, textAlign:'center', textDecorationLine:'underline'}}>
            {`${d.substring(0,4)} 4/18`}
          </Text> */}
            <FlatListSelector
              navigation={this.props.navigation}
              data={data}
              dayOfWeek={daysOfWeek[i]}
              curr={curr}/>
          </View>)
        })
      )
    }

  addDays = (date, days) => {
    var dat = new Date(date);
    dat.setDate(dat.getDate() + days);
    return dat;
  }

}
