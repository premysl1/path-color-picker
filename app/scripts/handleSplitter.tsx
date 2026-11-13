import React from "react";

export function handleSplitterDown(
splitter: React.RefObject<HTMLElement | null>,
event: React.PointerEvent) {
  if (!splitter.current) {
    return false;
  }

  splitter.current.setPointerCapture(event.pointerId);
  return true;
}

export interface containerInfo {
  isVertical: boolean,
	offset: number,
	length: number
}

export function handleSplitterMove(
panel1: React.RefObject<HTMLElement | null>,
splitter: React.RefObject<HTMLElement | null>,
containerInfo: React.RefObject<containerInfo | null>,
panel2: React.RefObject<HTMLElement | null>,
event: React.PointerEvent) {
  if (!(panel1.current
  && splitter.current?.hasPointerCapture(event.pointerId)
  && containerInfo.current
  && panel2.current)) {
    return;
  }

  const coordinate = containerInfo.current.isVertical ? event.clientX : event.clientY;
  const {offset, length} = containerInfo.current;
  const panel1Grow = (coordinate - offset) / length;

  panel1.current.style.flexGrow = String(Math.max(0, Math.min(1, panel1Grow)));
  panel2.current.style.flexGrow = String(Math.max(0, Math.min(1, 1 - panel1Grow)));
}

export interface dragStart {
  pointerId: number,
  x: number,
  y: number,
  leftPanelWidth: number,
  topRightPanelHeight: number
};

export function handleXySplitterDown(
dragStart: React.RefObject<dragStart | null>,
leftPanel: React.RefObject<HTMLElement | null>,
splitter: React.RefObject<HTMLDivElement | null>,
topRightPanel: React.RefObject<HTMLElement | null>,
event: React.PointerEvent) {
  if (!(handleSplitterDown(splitter, event)
  && leftPanel.current
  && topRightPanel.current)) {
    return;
  }

  dragStart.current = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    leftPanelWidth: leftPanel.current.getBoundingClientRect().width,
    topRightPanelHeight: topRightPanel.current.getBoundingClientRect().height,
  };
}

export interface panelsLengths {
  left: number | null,
  topRight: number | null
}

export function handleXySplittersMove(
dragStart: React.RefObject<dragStart | null>,
lengths: panelsLengths,
splitter: React.RefObject<HTMLElement | null>,
leftPanel: React.RefObject<HTMLElement | null>,
rightPanel: React.RefObject<HTMLElement | null>,
topRightPanel: React.RefObject<HTMLElement | null>,
bottomRightPanel: React.RefObject<HTMLElement | null>,
event: React.PointerEvent) {
  const start = dragStart.current;
  if (!(start
  && splitter.current?.hasPointerCapture(event.pointerId)
  && leftPanel.current
  && rightPanel.current
  && topRightPanel.current
  && bottomRightPanel.current
  && lengths.left
  && lengths.topRight)) {
    return;
  }

  const leftPanelGrow = (start.leftPanelWidth + event.clientX - start.x) / lengths.left;
  const rightPanelGrow = 1 - leftPanelGrow;
  const topRightPanelGrow = (start.topRightPanelHeight + event.clientY - start.y) / lengths.topRight;
  const bottomRightPanelGrow = 1 - topRightPanelGrow;

  leftPanel.current.style.flexGrow = String(Math.max(0, Math.min(1, leftPanelGrow)));
  rightPanel.current.style.flexGrow = String(Math.max(0, Math.min(1, rightPanelGrow)));
  topRightPanel.current.style.flexGrow = String(Math.max(0, Math.min(1, topRightPanelGrow)));
  bottomRightPanel.current.style.flexGrow = String(Math.max(0, Math.min(1, bottomRightPanelGrow)));
}