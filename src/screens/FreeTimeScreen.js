import React from 'react';
import { View, Text, FlatList,StyleSheet} from 'react-native';
import { Button } from 'react-native-elements';
import NavigationBar from 'navigationbar-react-native';
import Swiper from 'react-native-swiper';
import FreeTimeSelector from '../components/FreeTimeSelector';
import FlatListSelector from '../components/FlatListSelector';

const data = [
{key:0, time: '7:30 AM'}, {key:1, time: '8:00 AM'}, {key:2, time: '8:30 AM'}, {key:3, time: '9:00 AM'}, {key:4, time: '9:30 AM'},
{key:5, time: '10:00 AM'}, {key:6, time: '10:30 AM'}, {key:7, time: '11:00 AM'}, {key:8, time: '11:30 AM'}, {key:9, time: '12:00 PM'},
{key:10, time: '12:30 PM'}, {key:11, time: '1:00 PM'}, {key:12, time: '1:30 PM'}, {key:13, time: '2:00 PM'}, {key:14, time: '2:30 PM'},
{key:15, time: '3:00 PM'}, {key:16, time: '3:30 PM'}, {key:17, time: '4:00 PM'}, {key:18, time: '4:30 PM'}, {key:19, time: '5:00 PM'},
{key:20, time: '5:30 PM'}, {key:21, time: '6:00 PM'}, {key:22, time: '6:30 PM'}, {key:23, time: '7:00 PM'}, {key:24, time: '7:30 PM'}
]


export default class FreeTimeScreen extends React.Component {

  static navigationOptions = {
    title: 'Free Time',
  };
  constructor(props) {
    super(props);
    this.state = {selected: []};
  }

  onPressTime(time) {
    var arr = this.state.selected;
    var index = arr.indexOf(time);
    if (index > -1) arr.splice(index, 1);
    else arr.push(time);
    this.setState({selected: arr});
    console.log(this.state.selected);
  }

  renderItem = ({item, index}) => {
    if (this.state.selected.includes(item.key))
      return <Button backgroundColor='green' onPress={this.onPressTime.bind(this, item.key)} title={item.time}/>
    else
      return <Button onPress={this.onPressTime.bind(this, item.key)} title={item.time}/>
  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <NavigationBar componentCenter={<Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Free Time</Text>}/>
        <Swiper style={styles.wrapper} showsButtons={true}>
          <View>
            <Text>Monday</Text>
            <FlatListSelector data={data} dayOfWeek={'Monday'}/>
          </View>
          <View>
            <Text>Tuesday</Text>
            <FlatListSelector data={data} dayOfWeek={'Tuesday'}/>
          </View>
          <View>
            <Text>Wednesday</Text>
            <FlatListSelector data={data} dayOfWeek={'Wednesday'}/>
          </View>
          <View>
            <Text>Thursday</Text>
            <FlatListSelector data={data} dayOfWeek={'Thursday'}/>
          </View>
          <View>
            <Text>Friday</Text>
            <FlatListSelector data={data} dayOfWeek={'Friday'}/>
          </View>
          <View>
            <Text>Saturday</Text>
            <FlatListSelector data={data} dayOfWeek={'Saturday'}/>
          </View>
          <View>
            <Text>Sunday</Text>
            <FlatListSelector data={data} dayOfWeek={'Sunday'}/>
          </View>
        </Swiper>

      </View>
    );
  }
}

class FreeTimes extends React.Component {
  static navigationOptions = {
    title: 'Free Time',
  };

  constructor(props) {
    super(props);
    this.state = {FreeArray: new Array(25).fill(0)};
  }

  onPressTime(time) {
    var arr = this.state.selected;
    var index = arr.indexOf(time);
    if (index > -1) arr.splice(index, 1);
    else arr.push(time);
    this.setState({selected: arr});
  }

  renderItem = ({item, index}) => {
    if (this.state.selected.includes(item.time)) return <Button backgroundColor='green' onPress={this.onPressTime.bind(this, item.time)} title={item.time}/>
    else return <Button onPress={this.onPressTime.bind(this, item.time)} title={item.time}/>
  }

  render() {
    return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <NavigationBar componentCenter={<Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Free Time</Text>}/>
      <Swiper style={styles.wrapper} showsButtons={true}>
        <View>
          <Text>Monday</Text>
          <FlatListSelector data={data} />
        </View>
        <View style={styles.slkeye2}>
          <Text style={styles.text}>Beautiful</Text>
        </View>
        <View style={styles.slkeye3}>
          <Text style={styles.text}>And simple</Text>
        </View>
      </Swiper>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
  },
  slkeye1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  slkeye2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slkeye3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  }
})
