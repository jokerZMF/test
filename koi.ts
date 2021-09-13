/*
Riven
load dependency
"koi": "file:../pxt-koi"
*/

//% color="#5c7cfa" weight=10 icon="\u03f0"
//% groups='["Basic", "Robot", "Graphic", Classifier", "Tag/Code", "Audio", "Face", "Wifi", "CloudAI"]'
namespace koi {
  type EvtAct = () => void
  type EvtNum = (num: number) => void
  type Evtxy = (x: number, y: number) => void
  type Evtxywh = (x: number, y: number, w: number, h: number) => void
  type Evtxyr = (x: number, y: number, r: number) => void
  type Evtpp = (x1: number, y1: number, x2: number, y2: number) => void
  type Evttxt = (txt: string) => void
  type Evtsxy = (
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    rX: number,
    rY: number,
    rZ: number
  ) => void
  type Evtss = (t1: string, t2: string) => void
  type Evtsn = (t1: string, n: number) => void
  type Evtssnns = (t1: string, t2: string, n: number, n1: number, t3: string) => void

  let classifierEvt: Evttxt = null
  let kmodelEvt: EvtNum = null
  let speechCmdEvt: Evttxt = null
  let facetokenEvt: Evtssnns = null
  let facefoundEvt: Evtsn = null

  let btnEvt: Evtxy = null
  let circleEvt: Evtxyr = null
  let rectEvt: Evtxywh = null
  let colorblobEvt: Evtxywh = null
  let lineEvt: Evtpp = null
  let imgtrackEvt: Evtxywh = null
  let qrcodeEvt: Evttxt = null
  let barcodeEvt: Evttxt = null
  let apriltagEvt: Evtsxy = null
  let facedetEvt: Evtxy = null
  let ipEvt: Evttxt = null
  let mqttDataEvt: Evtss = null

  let lastCmd: Array<string> = null
  let faceNum = 0


  const PortSerial = [
    [SerialPin.P0, SerialPin.P8],
    [SerialPin.P1, SerialPin.P12],
    [SerialPin.P2, SerialPin.P13],
    [SerialPin.P14, SerialPin.P15],
  ]

  export enum SerialPorts {
    PORT1 = 0,
    PORT2 = 1,
    PORT3 = 2,
    PORT4 = 3,
  }

  export enum LcdDirection {
    //% block=Front
    Front = 0,
    //% block=Back
    Back = 2,
  }

  function trim(n: string): string {
    while (n.charCodeAt(n.length - 1) < 0x1f) {
      n = n.slice(0, n.length - 1)
    }
    return n
  }

  serial.onDataReceived('\n', function () {
    let a = serial.readUntil('\n')
    if (a.charAt(0) == 'K') {
      a = trim(a)
      let b = a.slice(1, a.length).split(' ')
      let cmd = parseInt(b[0])
      if (cmd == 42) {
        if (classifierEvt) {
          classifierEvt(b[1])
        }
      } else if (cmd == 46) {
        if (kmodelEvt) {
          kmodelEvt(parseInt(b[1]))
        }
      } else if (cmd == 3) {
        if (btnEvt) {
          btnEvt(parseInt(b[1]), parseInt(b[2])) // btna btnb
        }
      } else if (cmd == 10) {
        // circle position
        if (circleEvt) {
          circleEvt(parseInt(b[1]), parseInt(b[2]), parseInt(b[3])) // x y r
        }
      } else if (cmd == 11) {
        // rect return
        if (rectEvt) {
          rectEvt(
            parseInt(b[1]),
            parseInt(b[2]),
            parseInt(b[3]),
            parseInt(b[4])
          ) // x y w h
        }
      } else if (cmd == 12) {
        // line track
        if (lineEvt) {
          lineEvt(
            parseInt(b[1]),
            parseInt(b[2]),
            parseInt(b[3]),
            parseInt(b[4])
          )
        }
      } else if (cmd == 15) {
        // color blob
        if (colorblobEvt) {
          colorblobEvt(
            parseInt(b[1]),
            parseInt(b[2]),
            parseInt(b[3]),
            parseInt(b[4])
          )
        }
      } else if (cmd == 17) {
        // image track return
        if (imgtrackEvt) {
          imgtrackEvt(
            parseInt(b[1]),
            parseInt(b[2]),
            parseInt(b[3]),
            parseInt(b[4])
          )
        }
      } else if (cmd == 20) {
        // qrcode return
        if (qrcodeEvt) {
          qrcodeEvt(b[1])
        }
      } else if (cmd == 22) {
        // barcode return
        if (barcodeEvt) {
          barcodeEvt(b[1])
        }
      } else if (cmd == 23) {
        // april tag return
        if (apriltagEvt) {
          apriltagEvt(
            b[1],
            parseInt(b[2]),
            parseInt(b[3]),
            parseInt(b[4]),
            parseInt(b[5]),
            Math.roundWithPrecision(parseFloat(b[6]), 2),
            Math.roundWithPrecision(parseFloat(b[7]), 2),
            Math.roundWithPrecision(parseFloat(b[8]), 2)
          )
        }
      } else if (cmd == 31) {
        // face position
        if (facedetEvt && b[1]) {
          facedetEvt(parseInt(b[1]), parseInt(b[2]))
        }
      } else if (cmd == 32) {
        // face number
        faceNum = parseInt(b[1])
      } else if (cmd == 54) {
        // ip
        if (ipEvt) {
          ipEvt(b[1])
        }
      } else if (cmd == 55) {
        if (mqttDataEvt) {
          mqttDataEvt(b[1], b[2])
        }
      } else if (cmd == 65) {
        if (speechCmdEvt) {
          speechCmdEvt(b[1])
        }
      } else if (cmd == 75) {
        if (facetokenEvt) {
          // K75 token age gender ismask expression
          facetokenEvt(b[1], b[3], parseInt(b[2]), parseInt(b[4]), b[5])
        }
      } else if (cmd == 77) {
        if (facefoundEvt) {
          facefoundEvt(b[1], parseInt(b[2]))
        }
      } else {
        lastCmd = b.slice(1); // deep copy?
      }
      control.raiseEvent(EventBusSource.MES_BROADCAST_GENERAL_ID, 0x8900+cmd)
    }
  })

  function asyncWrite(msg: string, evt: number): void {
    serial.writeLine(msg)
    control.waitForEvent(EventBusSource.MES_BROADCAST_GENERAL_ID, 0x8900 + evt)

  }

  /**
   * init serial port
   * @param tx Tx pin; eg: SerialPin.P1
   * @param rx Rx pin; eg: SerialPin.P2
   */
  //% blockId=koi_initSerial block="KOI init|Tx pin %tx|Rx pin %rx"
  //% group="Basic" weight=100
  export function initSerial(tx: SerialPin, rx: SerialPin): void {
    serial.redirect(tx, rx, BaudRate.BaudRate115200)
    basic.pause(100)
    serial.setTxBufferSize(64)
    serial.setRxBufferSize(64)
    serial.readString()
    serial.writeString('\n\n')
    // take control of the ext serial port from KOI
    asyncWrite(`K0`, 0)
    basic.pause(300)
  }
/********************************************************************************** */

  /**
   * 发送控制命令
   * @param data buffer数组
   */
  //% blockId=koi_writeBuffer block="Robot write buffer| %cmd"
  //% group="Robot" weight=99
  export function writeBuffer(data: Buffer): void{
    serial.writeBuffer(data)
  }

/**
 * 运动控制
 */
  export enum Movement{
    //% blockId="goforward" block="go forward"
    FORWARD = 0x06,
    //% blockId="gobackward" block="go backward"
    BACKWARD = 0x07,
    //% blockId="turnleft" block="turn left"
    LEFT = 0x08,
    //% blockId="trunright" block="trun right"
    RIGHT = 0x09,
    //% blockId="stop" block="stop"
    STOP = 0x0a
  }


  /**
   * 控制机器人运动
   * @param movement 运动方式 
   */
  //% blockId=koi_controlRobot block="Control Robot| %move"
  //% group="Robot" weight=99
  export function controlRobot(movement: Movement): void{
    let cmd = Buffer.fromArray([0xff, 0x02, movement, 0x00])
    serial.writeBuffer(cmd)
  }

  export enum Level{
    //% blockId="fast" block="fast"
    fast = 0x01,
    //% blockId="low" block="low"
    low = 0x02
  }

  /**
   * 设置机器人运动速度
   * @param level 默认为fast, 可调参数为low
   */
  //% blockId=koi_setSpeedLevel block="Robot Set Speed Level to | %level"
  //% group="Robot" weight=99
  export function setSpeedLevel(level: Level): void{
    serial.writeBuffer(Buffer.fromArray([0xff,0x02,0x05,level]))
  }

  /**
   * 设置单一舵机角度
   * @param servo 舵机编号1-4
   * @param angle 角度0-180
   */
  //% blockId=koi_setServoAngle block="Robot Set Servo |%servo Angle |%angle"
  //% group="Robot" weight=99
  //% servo.min=1 servo.max=4 angle.min=0 angle.max=180
  export function setServoAngle(servo: number, angle: number): void{
    serial.writeBuffer(Buffer.fromArray([0xff, 0x02, servo, angle]))
  }

  export enum RemoteKey {
    num0 = 0x68,
    num1 = 0x30,
    num2 = 0x18,
    num3 = 0x7a,
    num4 = 0x10,
    num5 = 0x38,
    num6 = 0x5a,
    num7 = 0x42,
    num8 = 0x4a,
    num9 = 0x52,
    //% blockId="power" block="POWER"
    power = 0xa2,
    //% blockId="menu" block="MENU"
    menu = 0xe2,
    //% blockId="test" block="TEST"
    TEST = 0x22,
    //% blockId="plus" block="+"
    plus = 0x02,
    back = 0xc2,
    previous = 0xe0,
    play = 0xa8,
    next = 0x90,
    //% blockId="minus" block="-"
    minus = 0x98,
    //% blockId="cancel" block="C"
    cancel = 0xb0
  }

  /**
   * 判断按键是否按下
   * @param key 判断的按键
   * @returns 返回true or false
   */
  //% blockId=koi_isRemoteBtnPressed block="From |%buffer Is Remote Button |%key was pressed "
  //% group="Robot" weight=99
  export function isRemoteBtnPressed(buffer:Buffer, key: RemoteKey): boolean{
    // serial.writeBuffer(Buffer.fromArray([0xff,0x01,0x03,0x00]))
    let isPressed = false
    let data = buffer
    if(data){
      if (data[0] == 0xff && data[1] == 0x01 && data[2] == 0x01){
        if (data[3] == key)
          isPressed = true
        else
          isPressed = false
      }
    }
    return isPressed
  }

  /**
   * 获取声音响度
   * @returns 声音响度
   */
  //% blockId=koi_getSoundLoudness block="from |%buffer to get robot sound loudness "
  //% group="Robot" weight=99
  export function getSoundLoudness(buffer: Buffer):number{
    // serial.writeBuffer(Buffer.fromArray([0xff, 0x01, 0x02, 0x00]))
    let voice = 0
    let data = buffer
    if (data) {
      if (data[0] == 0xff && data[1] == 0x02 && data[2] == 0x01) {
        voice = data[3]
      }
    }
    return voice
  }

  /**
   * 校准舵机初始角度，一般在出厂安装的时候进行校正
   * @param id 舵机id号
   * @param angle 角度值，一般90上下
   */
  //% blockId=koi_calibServoAngle block="Robot calibrate servo |%id angle | %angle"
  //% group="Robot" weight=99
  //% id.min=1 id.max=4 angle.min=0 angle.max=180
  export function calibServoAngle(id: number, angle: number):void{
    serial.writeBuffer(Buffer.fromArray([0xff, 0x03, id, angle]))
  }

  export enum Sensors {
    //% blockId="sound" block="sound sensor"
    SOUND = 0x02,
    //% blockId="remote" block="remote controller"
    REMOTE = 0x03,
    //% blockId="ir" block="infrared sensor"
    IR = 0x04
  }

  /**
   * 使能传感器
   * @param sensor 可选参数为Sensors.SOUND, Sensors.IR, Sensors.REMOTE
   */
  //% blockId=koi_enableSensor block="Robot enable |%sensor"
  //% group="Robot" weight=99
  export function enableSensor(sensor: Sensors):void{
    serial.writeBuffer(Buffer.fromArray([0xff, 0x01, sensor, 0x01]))
  }

  /**
   * 取消使能传感器
   * @param sensor 可选参数为Sensors.SOUND, Sensors.IR, Sensors.REMOTE
   */
  //% blockId=koi_disableSensor block="Robot disable |%sensor"
  //% group="Robot" weight=99
  export function disableSensor(sensor: Sensors):void{
    serial.writeBuffer(Buffer.fromArray([0xff, 0x01, sensor, 0x00]))
  }

  /**
   * 正常模式，停止所有数据上传功能
   */
  //% blockId=koi_setNormalMode block="Robot set normal mode"
  //% group="Robot" weight=99
  export function setNormalMode():void{
    serial.writeBuffer(Buffer.fromArray([0xff,0x01,0x01, 0x00]))
  }

  // export enum Actions{
  //   ACTION1 = 0x0c,
  //   ACTION2 = 0x0d,
  //   ACTION3 = 0x0e,
  //   ACTION4 = 0x0f,
  // }

  export enum SubAction4{
    //% blockId="rst2tiptoe" block="复位->踮脚"
    RST2TIPTOE = 0X01,
    //% blockId="tiptoe2rst" block="踮脚->复位"
    TIPTOE2RST = 0X02,
  }

  export enum SubAction3 {
    //% blockId="rst2leftbent" block="复位->左弯腿"
    RST2LEFTBENT = 0x01,
    //% blockId="leftbent2rst" block="左弯腿->复位"
    LEFTBENT2RST = 0X02,
    //% blockId="rst2rightbent" block="复位->右弯腿"
    RST2RIGHTBENT = 0X03,
    //% blockId="rightbent2rst" block="右弯腿->复位"
    RIGHTBENT2RST = 0X04,
  }

  export enum SubAction2{
    //% blockId="rst2leftkick" block="复位->左踢腿"
    RST2LEFTKICK = 0x01,
    //% blockId="leftkick2rst" block="左踢腿->复位"
    LEFTKICK2RST = 0X02,
    //% blockId="rst2rightkick" block="复位->右踢腿"
    RST2RIGHTKICK = 0X03,
    //% blockId="rightkick2rst" block="右踢腿->复位"
    RIGHTKICK2RST = 0X04,
  }

  export enum SubAction1{
    //% blockId="rst2leftside" block="复位->左侧身"
    RST2LEFTSIDE = 0x01,
    //% blockId="leftside2rst" block="左侧身->复位"
    LEFTSIDE2RST = 0x02,
    //% blockId="rst2rightside" block="复位->右侧身"
    RST2RIGHTSIDE = 0x03,
    //% blockId="rightside2rst" block="右侧身->复位"
    RIGHTSIDE2RST = 0X04,

  }

  /**
   * 重置所有动作组
   */
  //% blockId=koi_resetAllAction block="Robot reset all action"
  //% group="Robot" weight=99
  export function resetAllAction():void{
    serial.writeBuffer(Buffer.fromArray([0xff, 0x02, 0x0b, 0x00]))
  }

  /**
   * 设置分部1动作
   * @param step 各部分单动作
   */
  //% blockId=koi_setSubAction1 block="Robot set subaction1| %step"
  //% group="Robot" weight=99
  export function setSubAction1(step: SubAction1):void{
    serial.writeBuffer(Buffer.fromArray([0xff,0x02,0x0c,step]))
  }

  /**
   * 设置分部4动作
   * @param step 各部分单动作
   */
  //% blockId=koi_setSubAction2 block="Robot set subaction2| %step"
  //% group="Robot" weight=99
  export function setSubAction2(step: SubAction2): void {
    serial.writeBuffer(Buffer.fromArray([0xff, 0x02, 0x0d, step]))
  }

  /**
   * 设置分部3动作
   * @param step 各部分单动作
   */
  //% blockId=koi_setSubAction3 block="Robot set subaction3| %step"
  //% group="Robot" weight=99
  export function setSubAction3(step: SubAction3): void {
    serial.writeBuffer(Buffer.fromArray([0xff, 0x02, 0x0e, step]))
  }

  /**
   * 设置分部2动作
   * @param step 各部分单动作
   */
  //% blockId=koi_setSubAction4 block="Robot set subaction4| %step"
  //% group="Robot" weight=99
  export function setSubAction4(step: SubAction4): void {
    serial.writeBuffer(Buffer.fromArray([0xff, 0x02, 0x0f, step]))
  }

  //% blockId=koi_getUltrasonicDistance block="Ultrasonic|Trig %Trig|Echo %Echo"
  //% group="Robot" weight=99
  export function getUltrasonicDistance(Trig: DigitalPin, Echo: DigitalPin): number {
    // send pulse
    let list: Array<number> = [0, 0, 0, 0, 0];
    for (let i = 0; i < 5; i++) {
      pins.setPull(Trig, PinPullMode.PullNone);
      pins.digitalWritePin(Trig, 0);
      control.waitMicros(2);
      pins.digitalWritePin(Trig, 1);
      control.waitMicros(15);
      pins.digitalWritePin(Trig, 0);

      let d = pins.pulseIn(Echo, PulseValue.High, 43200);
      list[i] = Math.floor(d / 40)
    }
    list.sort();
    let length = (list[1] + list[2] + list[3]) / 3;
    return Math.floor(length);
  }

/********************************************************************************* */

  //% blockId=koi_initPW block="KOI init powerbrick|Port %port"
  //% group="Basic" weight=99
  export function initPW(port: SerialPorts): void {
    initSerial(PortSerial[port][0], PortSerial[port][1])
  }

  //% blockId=koi_setLcdDirection block="KOI LCD Dir%dir"
  //% group="Basic" weight=98
  export function setLcdDirection(dir: LcdDirection): void {
    let str = `K6 ${dir}`
    serial.writeLine(str)
    basic.pause(100)
  }

  /**
   * @param t string to display; eg: hello
   * @param d delay; eg: 1000
   */
  //% blockId=koi_print block="KOI print %t X %x Y %y||delay %d ms"
  //% x.min=0 x.max=240
  //% y.min=0 y.max=240
  //% group="Basic" weight=97
  export function print(t: string, x: number,y: number, d:number=1000): void {
    let str = `K4 ${x} ${y} ${d} ${t}`
    serial.writeLine(str)
  }

  //% blockId=koi_onBtn block="on Button"
  //% weight=96
  //% group="Basic" draggableParameters=reporter
  export function onBtn(
    handler: (btnA: number, btnB: number) => void
  ): void {
    btnEvt = handler
  }

  /**
   * @param name savepath; eg: name.jpg
   */
  //% blockId=koi_screenshot block="KOI Screenshot %name"
  //% group="Basic" weight=95
  export function screenshot(name: string): void {
    let str = `K2 ${name}`
    serial.writeLine(str)
  }

  /**
   * @param name jpeg to display; eg: name.jpg
   */
  //% blockId=koi_display block="KOI Display %name"
  //% group="Basic" weight=94 blockGap=40
  export function display(name: string): void {
    let str = `K1 ${name}`
    serial.writeLine(str)
  }

  //% blockId=koi_resetCls block="KOI Reset Classifier"
  //% group="Classifier" weight=90
  export function resetCls(): void {
    let str = `K40`
    serial.writeLine(str)
  }

  /**
   * @param tag tag index; eg: cat
   */
  //% blockId=koi_addTag block="KOI Add Tag %tag"
  //% group="Classifier" weight=89
  export function addTag(tag: string): void {
    let str = `K41 ${tag}`
    serial.writeLine(str)
  }

  //% blockId=koi_run block="KOI Run Classifer"
  //% group="Classifier" weight=88
  export function run(): void {
    let str = `K42`
    serial.writeLine(str)
    // asyncWrite(str, 42)
  }

  //% blockId=koi_classified block="on Identified"
  //% group="Classifier" weight=87 draggableParameters=reporter
  export function classified(handler: (classId: string) => void) {
    classifierEvt = handler
  }

  /**
   * @param path json to save; eg: class.json
   */
  //% blockId=koi_cls_save block="KOI Save Classifier %path"
  //% group="Classifier" weight=86
  export function clsSave(path: string): void {
    let str = `K43 ${path}`
    serial.writeLine(str)
  }

  /**
   * @param path json to save; eg: class.json
   */
  //% blockId=koi_clsLoad block="KOI Load Classifier %path"
  //% group="Classifier" weight=85
  export function clsLoad(path: string): void {
    let str = `K44 ${path}`
    serial.writeLine(str)
  }


  /**
   * @param th threshold; eg: 2000
   */
  //% blockId=koi_trackCircle block="KOI track circle threshold%th"
  //% group="Graphic" weight=80
  export function trackCircle(th: number): void {
    let str = `K10 ${th}`
    serial.writeLine(str)

  }

  //% blockId=koi_onCircleTrack block="on Find Circle"
  //% group="Graphic" weight=79 draggableParameters=reporter blockGap=40
  export function onCircleTrack(
    handler: (x: number, y: number, r: number) => void
  ) {
    circleEvt = handler
  }

  /**
   * @param th threshold; eg: 6000
   */
  //% blockId=koi_trackRect block="KOI track rectangle %th"
  //% group="Graphic" weight=78
  export function trackRect(th: number): void {
    let str = `K11 ${th}`
    serial.writeLine(str)
  }

  //% blockId=koi_onRectTrack block="on Find Rectangle"
  //% group="Graphic" weight=77 draggableParameters=reporter blockGap=40
  export function onRectTrack(
    handler: (x: number, y: number, w: number, h: number) => void
  ) {
    rectEvt = handler
  }

  /**
   * @param key color key; eg: red
   */
  //% blockId=koi_colorCalib block="KOI color calibration %key"
  //% group="Graphic" weight=76
  export function colorCalib(key: string) {
    let str = `K16 ${key}`
    serial.writeLine(str)
  }

  /**
   * @param key color key; eg: red
   */
  //% blockId=koi_trackLine block="KOI track line %key"
  //% group="Graphic" weight=75
  export function trackLine(key: string): void {
    let str = `K12 ${key}`
    serial.writeLine(str)
  }

  //% blockId=koi_onLineTrack block="on Line Update"
  //% group="Graphic" weight=74 draggableParameters=reporter
  export function onLineTrack(
    handler: (x1: number, y1: number, x2: number, y2: number) => void
  ) {
    lineEvt = handler
  }

  /**
   * @param key color key; eg: red
   */
  //% blockId=koi_trackColorBlob block="KOI track color blob %key"
  //% group="Graphic" weight=73
  export function trackColorBlob(key: string): void {
    let str = `K15 ${key}`
    serial.writeLine(str)
  }

  //% blockId=koi_onColorBlob block="on Color blob"
  //% group="Graphic" weight=72 draggableParameters=reporter blockGap=40
  export function onColorBlob(
    handler: (x: number, y: number, w: number, h: number) => void
  ) {
    colorblobEvt = handler
  }

  //% blockId=koi_qrcodeScan block="KOI QR code"
  //% group="Tag/Code" weight=70
  export function qrcodeScan() {
    let str = `K20`
    serial.writeLine(str)
  }

  //% blockId=koi_onScanQrcode block="on QR code"
  //% group="Tag/Code" weight=69 draggableParameters=reporter blockGap=40
  export function onScanQrcode(handler: (link: string) => void) {
    qrcodeEvt = handler
  }

  //% blockId=koi_barcodeScan block="KOI BAR code"
  //% group="Tag/Code" weight=68
  export function barcodeScan() {
    let str = `K22`
    serial.writeLine(str)
  }

  //% blockId=koi_onScanBarcode block="on Barcode code"
  //% group="Tag/Code" weight=67 draggableParameters=reporter blockGap=40
  export function onScanBarcode(handler: (code: string) => void) {
    barcodeEvt = handler
  }

  //% blockId=koi_aprilTag block="KOI April Tag"
  //% group="Tag/Code" weight=66
  export function aprilTag() {
    let str = `K23`
    serial.writeLine(str)
  }

  //% blockId=koi_onAprilTag block="on AprilTag"
  //% group="Tag/Code" weight=65 draggableParameters=reporter blockGap=40
  export function onAprilTag(
    handler: (
      id: string,
      x: number,
      y: number,
      w: number,
      h: number,
      tX: number,
      tY: number,
      tZ: number
    ) => void
  ) {
    apriltagEvt = handler
  }

  //% blockId=koi_loadYoloFace block="KOI Load Face yolo"
  //% group="Face" weight=60
  export function loadYoloFace() {
    let str = `K30`
    serial.writeLine(str)
  }

  //% blockId=koi_faceDetect block="KOI face detect"
  //% group="Face" weight=59
  export function faceDetect() {
    let str = `K31`
    // serial.writeLine(str)
    // basic.pause(200)
    asyncWrite(str, 31)
  }

  //% blockId=koi_faceCount block="KOI face number"
  //% group="Face" weight=57 blockGap=40
  export function faceCount(): number {
    let str = `K32`
    asyncWrite(`K32`, 32)
    return faceNum
  }

  //% blockId=koi_onFindFace block="on Find Face"
  //% group="Face" weight=58 draggableParameters=reporter blockGap=40
  export function onFindFace(handler: (x: number, y: number) => void) {
    facedetEvt = handler
  }
  
  /**
   * @param ssid SSID; eg: ssid
   * @param pass PASSWORD; eg: password
   */
  //% blockId=koi_joinAp block="Join Ap %ssid %pass"
  //% group="Wifi" weight=50
  export function joinAp(ssid: string, pass: string) {
    serial.writeLine(`K50 ${ssid} ${pass}`)
  }

  //% blockId=koi_getIPAddr block="Wifi Get IP"
  //% group="Wifi" weight=49
  export function getIPAddr() {
    // serial.writeLine(`K54`)
    let str = `K54`
    asyncWrite(str, 54)
  }

  //% blockId=koi_ipOnRead block="on IP Data"
  //% group="Wifi" weight=48 draggableParameters=reporter
  export function ipOnRead(
    handler: (ip: string) => void
  ) {
    ipEvt = handler
  }  

  //% blockId=koi_getTime block="KOI get time"
  //% group="Wifi" weight=47
  export function getTime(): Array<string> {
    asyncWrite(`K56`, 56)
    return lastCmd
  }

  /**
   * @param host Mqtt host; eg: iot.kittenbot.cn
   * @param cid Client ID; eg: clientid
   * @param port Host Port; eg: 1883
   * @param user Username; eg: user
   * @param pass Password; eg: pass
   */
  //% blockId=koi_setMqttHost block="Mqtt Host %host| clientID%cid||Port%port User%user Pass%pass"
  //% group="Wifi" weight=46
  export function setMqttHost(
    host: string,
    cid: string,
    port: number = 1883,
    user: string = null,
    pass: string = null
  ) {
    if (user && pass) {
      serial.writeLine(`K51 ${host} ${cid} ${port} ${user} ${pass}`)
    } else {
      serial.writeLine(`K51 ${host} ${cid} ${port}`)
    }
  }

  /**
   * @param topic Topic to subscribe; eg: /topic
   */
  //% blockId=koi_mqttSub block="Mqtt Subscribe %topic"
  //% group="Wifi" weight=45
  export function mqttSub(topic: string) {
    serial.writeLine(`K52 ${topic}`)
  }

  /**
   * @param topic Topic to publish; eg: /topic
   * @param data Data to publish; eg: hello
   */
  //% blockId=koi_mqttPub block="Mqtt Publish %topic %data"
  //% group="Wifi" weight=44
  export function mqttPub(topic: string, data: string) {
    serial.writeLine(`K53 ${topic} ${data}`)
  }

  /**
   * @param topic Mqtt Read; eg: /topic
   */
  //% blockId=koi_mqttRead block="Mqtt Read %topic"
  //% group="Wifi" weight=43
  export function mqttRead(topic: string) {
    topic = topic || ''
    let str = `K55 ${topic}`
    serial.writeLine(str)
    // asyncWrite(str, 55)
    
  }

  //% blockId=koi_onMqttRead block="on Mqtt Data"
  //% group="Wifi" weight=42 draggableParameters=reporter
  export function onMqttRead(
    handler: (data: string, topic: string) => void
  ) {
    mqttDataEvt = handler
  }


  /**
   * @param file Wav File to record; eg: say.wav
   */
  //% blockId=koi_audioRec block="WAV Rec %file"
  //% group="Audio" weight=40
  export function audioRec(file: string) {
    serial.writeLine(`K61 ${file}`)
  }

  /**
   * @param file Wav File to play; eg: say.wav
   */
  //% blockId=koi_audioPlay block="WAV Play %file"
  //% group="Audio" weight=39
  export function audioPlay(file: string) {
    serial.writeLine(`K62 ${file}`)
  }

  //% blockId=koi_calibAudioNoisetap block="Calibrate noise"
  //% group="Audio" weight=38
  export function calibAudioNoisetap(): void {
    serial.writeLine(`K63`)
  }

  /**
   * @param classid Speech Cmd add; eg: cmd
   */
  //% blockId=koi_speechcmdAddModel block="Speech Cmd add %classid"
  //% group="Audio" weight=37
  export function speechcmdAddModel(classid: string) {
    serial.writeLine(`K64 ${classid}`)
  }

  //% blockId=koi_speechcmdListen block="Speech Cmd Listen"
  //% group="Audio" weight=36
  export function speechcmdListen(): void {
    let str = `K65`
    serial.writeLine('K65')
    // asyncWrite(str, 65)
  }

  //% blockId=koi_onSpeechcmdRecognize block="on Speech Cmd"
  //% group="Audio" weight=35 draggableParameters=reporter
  export function onSpeechcmdRecognize(
    handler: (classId: string) => void
  ) {
    speechCmdEvt = handler
  }

  /**
   * @param path json to save; eg: cmd.json
   */
  //% blockId=koi_speechcmdSave block="KOI Save speech cmd %path"
  //% group="Audio" weight=34
  export function speechcmdSave(path: string): void {
    let str = `K66 ${path}`
    serial.writeLine(str)
  }

  /**
   * @param path json to save; eg: cmd.json
   */
  //% blockId=koi_speechcmdLoad block="KOI Load speech cmd %path"
  //% group="Audio" weight=33 blockGap=40
  export function speechcmdLoad(path: string): void {
    let str = `K67 ${path}`
    serial.writeLine(str)
  }
  
  //% blockId=koi_cloudFaceRecognize block="KOI Cloud Face Recognize"
  //% group="CloudAI" weight=30
  export function cloudFaceRecognize() {
    let str = `K75`
    serial.writeLine(`K75`)
    // asyncWrite(str, 75)
  }

  //% blockId=koi_onCloudRegFace block="on Recognize Face"
  //% group="CloudAI" weight=29 draggableParameters=reporter
  export function onCloudRegFace(
    handler: (token: string, sex: string, age: number, mask: number, expression: string) => void
  ) {
    facetokenEvt = handler
  }

  //% blockId=koi_cloudFaceAddGroup block="add face token %TOKEN to Group %GROUP with name %NAME"
  //% group="CloudAI" weight=28
  export function cloudFaceAddGroup(
    TOKEN: string,
    GROUP: string,
    NAME: string
  ) {
    serial.writeLine(`K76 ${TOKEN} ${GROUP} ${NAME}`)
  }

  //% blockId=koi_cloudFaceSearch block="search face token %TOKEN in group %GROUP"
  //% group="CloudAI" weight=27
  export function cloudFaceSearch(TOKEN: string, GROUP: string) {
    let str =`K77 ${TOKEN} ${GROUP}`
    serial.writeLine(str)
    // asyncWrite(str, 77)
  }

  //% blockId=koi_onCloudFindFace block="on Find Face"
  //% group="CloudAI" weight=26 draggableParameters=reporter blockGap=40
  export function onCloudFindFace(
    handler: (name: string, confidence: number) => void
  ) {
    facefoundEvt = handler
  }

  /**
   * @param TXT text to speech; eg: hello world
   */
  //% blockId=koi_cloudTts block="TTS %TXT"
  //% group="CloudAI" weight=25
  export function cloudTts(TXT: string) {
    let str = TXT.split(' ').join('.')
    serial.writeLine(`K78 ${str}`)
  }


  //% blockId=koi_reset block="KOI reset"
  //% group="Basic" weight=10
  //% advanced=true
  export function reset(): void {
    serial.writeLine(`K99`)
  }

  //% blockId=koi_stopKpu block="KOI Stop kpu"
  //% group="Basic" weight=9 blockGap=40
  //% advanced=true
  export function stopKpu(): void {
    let str = `K98`
    serial.writeLine(str)
  }

  // /**
  //  * @param txt string to display; eg: 你好世界
  //  */
  // //% blockId=koi_print_unicode block="Print UNICODE X %x Y %y %txt||delay %delay ms"
  // //% x.min=0 x.max=240
  // //% y.min=0 y.max=240
  // //% group="Basic" weight=100
  // //% advanced=true
  // export function koi_print_unicode(
  //   x: number,
  //   y: number,
  //   txt: string,
  //   delay: number = 1000
  // ): void {
  //   let s: string = '${';
  //   for (let i=0;i<txt.length;i++){
  //     s += txt.charCodeAt(i)
  //     if (i != (txt.length-1)) s += ','
  //   }
  //   s += '}'
    
  //   let str = `K5 ${x} ${y} ${delay} ${s}`
  //   serial.writeLine(str)
  // }
 

  /**
   * @param path kmodel to load; eg: model.kmodel
   */
  //% blockId=koi_loadKmodel block="Load KNN model %path"
  //% group="Classifier" weight=90
  //% advanced=true
  export function loadKmodel(path: string) {
    let str = `K45 ${path}`
    serial.writeLine(str)
  }

  //% blockId=koi_inference block="KNN inference"
  //% group="Classifier" weight=89
  //% advanced=true
  export function inference() {
    let str = `K46`
    serial.writeLine(`K46`)
    // asyncWrite(str, 46)
  }

  //% blockId=koi_onInference block="on Inference"
  //% group="Classifier" weight=88 draggableParameters=reporter blockGap=40
  //% advanced=true
  export function onInference(handler: (index: number) => void) {
    kmodelEvt = handler
  }

}


