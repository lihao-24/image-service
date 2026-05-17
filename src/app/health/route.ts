export function GET() {
  return Response.json({
    status: "ok",
    service: "image-service",
    message: "服务骨架运行正常"
  });
}
