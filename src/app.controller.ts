import { Body, Controller, Get, Post } from "@nestjs/common"
import { AppService, RequestTokensDTO } from "./app.service"


@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get("token-address")
    getTokenAddress() {
        return {result: this.appService.getTokenAddress()}
    }

    @Get("ballot-address")
    getBallotAddress() {
        return {result: this.appService.getBallotAddress()}
    }

    @Get("token-request-counter")
    getCounterTokenRequest() {
        return {result: this.appService.getCounterTokenRequest()}
    }

    @Post("request-tokens")
    requestTokens(@Body() requestTokensDTO: RequestTokensDTO) {
        return {result: this.appService.requestTokens(requestTokensDTO)}
    }
}
