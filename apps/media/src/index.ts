// Media processing Worker (stage 5): queue consumer, photo processing with Cloudflare Images,
// video processing in the ffmpeg container, and the container's internal callback endpoints.
export default {
  async fetch() {
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
