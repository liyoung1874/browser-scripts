<script setup>
// @ts-nocheck
import { ref, onMounted } from "vue";
import { ElButton, ElDialog, ElNotification } from "element-plus";
import {
  getCookie,
  setDebugNamespace,
  sleep,
  getDelayUntilNextTargetTime,
  ms2str,
  log
} from "./tools";

const namespace = "weibo";
setDebugNamespace("weibo");
const logger = (...args) => log(namespace, ...args);

const dialogVisible = ref(false);
const Token = ref("");
const stSwitch = ref(false);
const dailyTimer = ref(null);
const dailyDelay = ref(null);
const position = 'bottom-right';
const targetTime = ref("9:00");
let reloadTry = 3;

const openDialog = async () => {
  logger("自动配置窗口打开！");
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  logger("自动配置窗口关闭！");

  // if stSwitch is on, start task
  if (stSwitch.value) {
    startDailyTask();
  } else {
    logger("清除自动签到任务！");
    clearTimeout(dailyDelay.value);
    clearInterval(dailyTimer.value);
  }
  saveConfig();
};

const saveConfig = () => {
  logger("保存配置！");
  localStorage.setItem(
    "weibo:config",
    JSON.stringify({
      stSwitch: stSwitch.value,
      reloadTry,
      targetTime: targetTime.value,
    })
  );
};

const loadConfig = () => {
  logger("加载配置！");
  const config = JSON.parse(localStorage.getItem("weibo:config"));
  const { stSwitch: Switch, reloadTry: Try, targetTime: time } = config;
  stSwitch.value = Switch || false;
  reloadTry = Try || 3;
  targetTime.value = time || "9:00";
  logger("加载配置成功！");
  logger("自动签到配置", stSwitch.value);
  logger("签到时间", targetTime.value);
};

const autoRegister = async () => {
  // wait for page loaded
  await sleep(3);

  // check if in super index page
  if (!isSuperIndex()) {
    logger("当前不在超话页面！");
    return;
  }

  // check if auto sign in is on
  if (!stSwitch.value) {
    logger("自动签到未开启！");
    return;
  }

  // get sign in button
  const btn = document.querySelector(
    '[action-data*="api=http://i.huati.weibo.com/aj/super/checkin"]'
  );
  if (!btn && reloadTry > 0) {
    logger("未找到签到或已签到按钮！");
    reloadTry -= 1;
    saveConfig();
    handleFllow();
  } else if (!btn && reloadTry === 0) {
    logger("未找到签到或已签到按钮！");
    ElNotification({
      title: "超话签到通知",
      message: `超话签到失败！未找到签到或已签到按钮！异常时间${new Date().toLocaleString()}`,
      type: "error",
      duration: 0,
      position,
    });
    return;
  }

  const flag = btn.innerHTML.includes("已签到");
  if (flag) {
    logger("当前超话已签到！");
    return;
  }

  // 签到
  await sleep();
  btn.click();

  const res = await handleError();
  if (res === 'error' || res === 'not sure') {
    return;
  }
  if (res === 'warning') {
    await sleep();
    btn.click();
    return;
  }

  logger("签到成功！");
  ElNotification({
    title: "超话签到通知",
    message: `超话签到成功！签到时间${new Date().toLocaleString()}`,
    type: "success",
    duration: 0,
    position,
  });
};

const isSuperIndex = () => {
  return (
    window.location.href.includes("https://weibo.com/p/") &&
    window.location.href.includes("super_index")
  );
};

const handleFllow = async () => {
  // 判断是否关注成功
  logger("尝试关注超话！");
  await sleep();
  // get follow button
  const followBtn = document.querySelector('div[node-type="followBtnBox"]');
  if (!followBtn) {
    logger("未找到关注按钮！");
  }

  if (followBtn.innerHTML.includes("已关注")) {
    logger("已关注！");
  } else {
    logger("点击关注超话！");
    followBtn.querySelector("a").click();
  }
  window.location.reload();
};

const handleError = async () => {
  // 判断是否出错
  await sleep(3);
  const errConfirm = document.querySelector("a[action-type='ok']");
  if (errConfirm) {
    if (errConfirm.innerHTML.includes("解除异常")) {
      logger("出现解除异常提示！请手动解除异常！");
      ElNotification({
        title: "超话签到通知",
        message: `超话签到异常！出现解除异常提示！请手动解除异常！解除异常后刷新页面重试。异常时间${new Date().toLocaleString()}`,
        type: "error",
        duration: 0,
        position,
      });
      return 'error';
    } else if (errConfirm.innerHTML.includes("确定")) {
      logger("弹出异常提示！");
      errConfirm.click();
      logger("点击异常提示，关闭异常提示！");
      return 'warning';
    } else {
      logger("未知异常！");
      ElNotification({
        title: "超话签到通知",
        message: `超话签到异常！未知异常！异常时间${new Date().toLocaleString()}`,
        type: "error",
        duration: 0,
        position,
      });
      return 'not sure';
    }
  }
  return true;
};

const startDailyTask = () => {
  logger("开启自动签到任务！");
  // clear previous task
  clearTimeout(dailyDelay.value);
  clearInterval(dailyTimer.value);

  // excute immediately a time
  autoRegister();

  // start daily task
  const [hour, minute] = targetTime.value.split(":");
  const delay = getDelayUntilNextTargetTime(+hour, +minute);
  logger("距离下一次签到还有：", ms2str(delay));

  dailyDelay.value = setTimeout(() => {
    // then reload page and auto sign will be excuted
    window.location.reload();

    dailyTimer.value = setInterval(() => {
      // then reload page and auto sign will be excuted
      window.location.reload();
    }, 1000 * 60 * 60 * 24);
  }, delay);
};

onMounted(async () => {
  await sleep(3);
  loadConfig();
  if (stSwitch.value) {
    startDailyTask();
  }
});
</script>

<script>
export default {
  name: "Weibo",
};
</script>

<template>
  <div>
    <el-dialog title="自动配置" center v-model="dialogVisible" :close-on-click-modal="false" :close-on-press-escape="false"
      :show-close="false" destroy-on-close width="65%">
      <div>
        <div class="content" style="width: 500px">
          <div class="flex-row">
            <el-text class="mx-1" size="large">超话签到</el-text>
            <el-switch v-model="stSwitch" active-text="开" inactive-text="关" />
          </div>
          <div class="flex-row">
            <el-text class="mx-1" size="large">签到时间</el-text>
            <el-time-select v-model="targetTime" style="width: 240px" start="06:30" step="00:30" end="23:30"
              placeholder="Select time" />
          </div>
        </div>
      </div>
      <div style="margin-top: 2rem; text-align: center">
        <el-button size="large" type="primary" @click="closeDialog">确定</el-button>
        <el-button size="large" @click="dialogVisible = false">取消</el-button>
      </div>
    </el-dialog>

    <el-button type="primary" class="configBtn" @click="openDialog">自动配置</el-button>
  </div>
</template>

<style scoped>
.configBtn {
  position: fixed;
  left: 3rem;
  bottom: 5rem;
  z-index: 99999999 !important;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem 0;
}

.flex-row {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
}
</style>
