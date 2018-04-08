import React from 'react';
import { View, Text, FlatList,StyleSheet, ScrollView} from 'react-native';
import { Button } from 'react-native-elements';
import NavigationBar from 'navigationbar-react-native';
import FlatListSelector from '../components/FlatListSelector';

const data = [
{key:0, time: '7:30 AM'}, {key:1, time: '8:00 AM'}, {key:2, time: '8:30 AM'}, {key:3, time: '9:00 AM'}, {key:4, time: '9:30 AM'},
{key:5, time: '10:00 AM'}, {key:6, time: '10:30 AM'}, {key:7, time: '11:00 AM'}, {key:8, time: '11:30 AM'}, {key:9, time: '12:00 PM'},
{key:10, time: '12:30 PM'}, {key:11, time: '1:00 PM'}, {key:12, time: '1:30 PM'}, {key:13, time: '2:00 PM'}, {key:14, time: '2:30 PM'},
{key:15, time: '3:00 PM'}, {key:16, time: '3:30 PM'}, {key:17, time: '4:00 PM'}, {key:18, time: '4:30 PM'}, {key:19, time: '5:00 PM'},
{key:20, time: '5:30 PM'}, {key:21, time: '6:00 PM'}, {key:22, time: '6:30 PM'}, {key:23, time: '7:00 PM'}, {key:24, time: '7:30 PM'}
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
    var today = new Date()
    this.setState({today:today})
  }

  renderDaysofWeek = (today) => {
      daysOfWeek = []
      dates = []
      for (i = 0; i < 7; i++) {
        day = this.addDays(today, i)
        daysOfWeek.push(days[day.getDay()])
        dates.push(day.toDateString())
      }

      return (
        dates.map((d, i)=> {
          return (
          <View key={i} style={{alignItems:'center'}}>
            <Text style={{fontWeight:'bold'}}>{d.substring(0,10)}</Text>
            <FlatListSelector data={data} dayOfWeek={daysOfWeek[i]}/>
          </View>)
        })
      )

    }

    addDays = (date, days) => {
      var dat = new Date(date);
      dat.setDate(dat.getDate() + days);
      return dat;
    }


  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <ScrollView horizontal={true} >
          {this.renderDaysofWeek(this.state.today)}
        </ScrollView>
      </View>
    );
  }
}
